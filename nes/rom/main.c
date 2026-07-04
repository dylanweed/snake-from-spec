/*
 * Snake, ported to 6502 C for the NES (compiled with cc65's `nes` target).
 *
 * Mirrors spec-step.md's world model and step() function, and
 * spec-runtime.md's game loop and opposite-direction rejection rule, using
 * the same 20x20 grid and ~150ms tick interval as the other implementations.
 *
 * Rendering is background-tile only: the playfield (nametable rows 0-19)
 * uses one BG palette, the HUD band below it (rows 20-29) uses a second BG
 * palette, so the HUD's colors (white digits, red death alert) don't have
 * to share the playfield's wall/body/head colors.
 */

#include <nes.h>
#include <joystick.h>

#define GRID_W 20
#define GRID_H 20

#define TILE_EMPTY 0
#define TILE_WALL 1
#define TILE_BODY 2

#define DIR_UP 0
#define DIR_DOWN 1
#define DIR_LEFT 2
#define DIR_RIGHT 3
#define DIR_NONE 0xFF

#define TICK_FRAMES 9 /* ~150ms at NTSC 60fps, matching TICK_INTERVAL_MS in the TS implementations */

#define CHR_BLANK 0
#define CHR_WALL 1
#define CHR_BODY 2
#define CHR_HEAD 3
#define CHR_DIGIT0 4

#define SCORE_ROW 20
#define ALERT_ROW 22

static const signed char DX[4] = { 0, 0, -1, 1 };
static const signed char DY[4] = { -1, 1, 0, 0 };
static const unsigned char OPPOSITE_DIR[4] = { DIR_DOWN, DIR_UP, DIR_RIGHT, DIR_LEFT };

static unsigned char grid[GRID_H][GRID_W];
static unsigned char snake_x, snake_y;
static unsigned char next_dir;
static unsigned char pending_dir;
static unsigned char alive;
static unsigned int score;
static unsigned char frame_count;
static unsigned char joy_prev;

static void ppu_addr(unsigned int addr) {
    PPU.vram.address = (unsigned char)(addr >> 8);
    PPU.vram.address = (unsigned char)(addr & 0xFF);
}

/* $2006 writes share the PPU's internal scroll registers with $2005 -- every
 * VRAM address we set doubles as a scroll position. Without resetting it,
 * whatever nametable address a batch of writes finishes on becomes the
 * on-screen scroll offset, showing a shifted/wrapped view of the nametable.
 * Reading PPUSTATUS resets the $2005/$2006 write-toggle so the two writes
 * below are unambiguously interpreted as (scroll_x, scroll_y) = (0, 0). */
static void reset_scroll(void) {
    (void)PPU.status;
    PPU.scroll = 0;
    PPU.scroll = 0;
}

static void draw_tile(unsigned char x, unsigned char y, unsigned char tile) {
    ppu_addr(0x2000 + (unsigned int)y * 32 + x);
    PPU.vram.data = tile;
}

static void draw_score(void) {
    unsigned char hundreds = (score / 100) % 10;
    unsigned char tens = (score / 10) % 10;
    unsigned char ones = score % 10;
    ppu_addr(0x2000 + (unsigned int)SCORE_ROW * 32);
    PPU.vram.data = CHR_DIGIT0 + hundreds;
    PPU.vram.data = CHR_DIGIT0 + tens;
    PPU.vram.data = CHR_DIGIT0 + ones;
}

static void set_alert_row(unsigned char tile) {
    unsigned char x;
    ppu_addr(0x2000 + (unsigned int)ALERT_ROW * 32);
    for (x = 0; x < 32; x++) {
        PPU.vram.data = tile;
    }
}

static void setup_palette(void) {
    static const unsigned char pal[8] = {
        0x0F, /* universal background: black */
        0x00, /* playfield color 1: wall (gray) */
        0x1A, /* playfield color 2: body (green) */
        0x2A, /* playfield color 3: head (bright green) */
        0x0F, /* mirror of universal background */
        0x16, /* HUD color 1: alert bar (red) */
        0x30, /* HUD color 2: digits (white) */
        0x0F  /* HUD color 3: unused */
    };
    unsigned char i;
    ppu_addr(0x3F00);
    for (i = 0; i < 8; i++) {
        PPU.vram.data = pal[i];
    }
}

static void setup_attributes(void) {
    unsigned char rb, cb, val;
    ppu_addr(0x23C0);
    for (rb = 0; rb < 8; rb++) {
        val = (rb < 5) ? 0x00 : 0x55; /* rows 0-19 -> BG palette 0, rows 20+ -> BG palette 1 */
        for (cb = 0; cb < 8; cb++) {
            PPU.vram.data = val;
        }
    }
}

static void draw_full_board(void) {
    unsigned char x, y, tile;
    for (y = 0; y < 30; y++) {
        ppu_addr(0x2000 + (unsigned int)y * 32);
        for (x = 0; x < 32; x++) {
            tile = CHR_BLANK;
            if (y < GRID_H && x < GRID_W) {
                tile = (grid[y][x] == TILE_WALL) ? CHR_WALL : CHR_BLANK;
            }
            PPU.vram.data = tile;
        }
    }
    draw_tile(snake_x, snake_y, CHR_HEAD);
}

/* Initial state: border walls, snake centered facing up, alive, score 0 --
 * a direct port of html5-canvas/src/main.ts's borderWalls()/initialState(). */
static void reset_game(void) {
    unsigned char x, y;
    for (y = 0; y < GRID_H; y++) {
        for (x = 0; x < GRID_W; x++) {
            int is_wall = (x == 0 || x == GRID_W - 1 || y == 0 || y == GRID_H - 1);
            grid[y][x] = is_wall ? TILE_WALL : TILE_EMPTY;
        }
    }
    snake_x = GRID_W / 2;
    snake_y = GRID_H / 2;
    next_dir = DIR_UP;
    pending_dir = DIR_NONE;
    alive = 1;
    score = 0;
    frame_count = 0;

    /* See game_step(): VRAM writes need rendering off. This matters here
     * because reset_game() can run mid-game (Start button), not just at boot. */
    PPU.mask = 0x00;
    draw_full_board();
    draw_score();
    set_alert_row(CHR_BLANK);
    reset_scroll();
    PPU.mask = 0x0A;
}

/* step(): a direct port of spec-step.md / html5-canvas/src/model/step.ts.
 * A dead snake is never revived -- step() is a no-op once alive is false. */
static void game_step(void) {
    unsigned char cx, cy;

    if (!alive) {
        return;
    }

    cx = snake_x + DX[next_dir];
    cy = snake_y + DY[next_dir];

    /* Every VRAM write below (however few) must happen with rendering off:
     * writing $2007 while the PPU is actively rendering scrambles the
     * effective address after only a couple of bytes, since the write
     * target during rendering is derived from the PPU's internal scroll
     * counters rather than a simple linear address (real hardware behavior
     * that jsnes also models). A single tick only touches a handful of
     * tiles, so the forced-blank flicker this causes is imperceptibly brief. */
    PPU.mask = 0x00;
    if (cx >= GRID_W || cy >= GRID_H || grid[cy][cx] != TILE_EMPTY) {
        alive = 0;
        set_alert_row(CHR_WALL);
    } else {
        grid[snake_y][snake_x] = TILE_BODY;
        draw_tile(snake_x, snake_y, CHR_BODY);

        snake_x = cx;
        snake_y = cy;
        score++;

        draw_tile(snake_x, snake_y, CHR_HEAD);
        draw_score();
    }
    reset_scroll();
    PPU.mask = 0x0A;
}

/* Mirrors gameLoop.ts: keydown-equivalent direction events are latched into
 * pending_dir (rejecting a reversal of the currently-effective direction),
 * and applied to next_dir at the next tick boundary. Start is edge-detected
 * against the previous frame's controller reading so a held Start button
 * doesn't restart every single frame. */
static void poll_input(void) {
    unsigned char v = joy_read(JOY_1);
    unsigned char pressed = v & (unsigned char)~joy_prev;
    unsigned char dir = DIR_NONE;
    unsigned char effective;

    joy_prev = v;

    if (JOY_UP(v)) {
        dir = DIR_UP;
    } else if (JOY_DOWN(v)) {
        dir = DIR_DOWN;
    } else if (JOY_LEFT(v)) {
        dir = DIR_LEFT;
    } else if (JOY_RIGHT(v)) {
        dir = DIR_RIGHT;
    }

    if (dir != DIR_NONE) {
        effective = (pending_dir != DIR_NONE) ? pending_dir : next_dir;
        if (dir != OPPOSITE_DIR[effective]) {
            pending_dir = dir;
        }
    }

    if (JOY_START(pressed)) {
        reset_game();
    }
}

void main(void) {
    joy_install(joy_static_stddrv);

    PPU.control = 0x00;
    PPU.mask = 0x00;

    setup_palette();
    setup_attributes();
    reset_game(); /* leaves rendering enabled (PPU.mask = 0x0A) */

    while (1) {
        waitvsync();
        reset_scroll(); /* cc65's runtime touches $2006 on its own each frame; pin scroll every frame, not just on ticks */
        poll_input();

        frame_count++;
        if (frame_count >= TICK_FRAMES) {
            frame_count = 0;
            if (pending_dir != DIR_NONE) {
                next_dir = pending_dir;
                pending_dir = DIR_NONE;
            }
            game_step();
        }
    }
}
