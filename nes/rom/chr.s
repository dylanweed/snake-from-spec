; CHR-ROM tile data: one 8KB pattern-table bank.
;
; Each tile is 16 bytes: 8 bytes of bitplane 0, then 8 bytes of bitplane 1.
; Combining the two bits per pixel gives a 2-bit color index (0-3) that is
; resolved to an actual color via whichever background palette (0 or 1) the
; attribute table assigns to that part of the screen -- see rom/main.c.
;
; Tiles 0-3 are solid blocks (color index 1, 2, or 3 for every pixel):
;   0 = blank        (color 0 - shared universal background)
;   1 = wall / alert  (color 1 - gray on the playfield, red in the HUD)
;   2 = snake body    (color 2 - green on the playfield)
;   3 = snake head    (color 3 - bright green on the playfield)
;
; Tiles 4-13 are the digits 0-9, drawn in color 2 (white in the HUD palette)
; on a color-0 background, using a classic 5x7 dot-matrix numeral shape
; centered in the 8x8 tile with a 1px left margin and 1px top margin.

.segment "CHARS"

; Tile 0: blank
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$00,$00,$00,$00,$00,$00,$00

; Tile 1: wall / alert bar (solid color 1)
.byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF
.byte $00,$00,$00,$00,$00,$00,$00,$00

; Tile 2: snake body (solid color 2)
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF

; Tile 3: snake head (solid color 3)
.byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF
.byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF

; Tile 4: digit 0
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$38,$44,$4C,$54,$64,$44,$38

; Tile 5: digit 1
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$10,$30,$10,$10,$10,$10,$38

; Tile 6: digit 2
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$38,$44,$04,$08,$10,$20,$7C

; Tile 7: digit 3
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$7C,$08,$10,$08,$04,$44,$38

; Tile 8: digit 4
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$08,$18,$28,$48,$7C,$08,$08

; Tile 9: digit 5
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$7C,$40,$78,$04,$04,$44,$38

; Tile 10: digit 6
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$18,$20,$40,$78,$44,$44,$38

; Tile 11: digit 7
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$7C,$04,$08,$10,$20,$20,$20

; Tile 12: digit 8
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$38,$44,$44,$38,$44,$44,$38

; Tile 13: digit 9
.byte $00,$00,$00,$00,$00,$00,$00,$00
.byte $00,$38,$44,$44,$3C,$04,$08,$30
