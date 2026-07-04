import { Browser } from "jsnes";

const container = document.querySelector<HTMLDivElement>("#screen")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;

fetch(`${import.meta.env.BASE_URL}game.nes`)
  .then((res) => res.arrayBuffer())
  .then((buffer) => {
    // jsnes expects ROM data as a "binary string" (one char per byte).
    const bytes = new Uint8Array(buffer);
    let romData = "";
    for (let i = 0; i < bytes.length; i++) {
      romData += String.fromCharCode(bytes[i]);
    }
    statusEl.remove();
    const browser = new Browser({
      container,
      romData,
      onError: (error: unknown) => {
        statusEl.textContent = `Error: ${String(error)}`;
        container.appendChild(statusEl);
      },
    });
    // jsnes simulates CRT overscan by blacking out the outer 8px border by
    // default. The playfield's border walls sit right at the edge of the
    // grid, so keep the full frame visible instead of clipping it.
    // `ppu` isn't part of jsnes's public NES type, hence the cast.
    (browser.nes as unknown as { ppu: { clipToTvSize: boolean } }).ppu.clipToTvSize = false;

    // Browser.fitInParent() sizes the canvas to the full 256x240 frame via
    // an inline style, which would override the CSS crop below (#screen
    // canvas { width: 160% }) since inline styles win over stylesheet rules.
    // Clear it so the stylesheet's crop takes effect.
    const canvas = container.querySelector("canvas");
    canvas?.removeAttribute("style");
  })
  .catch((error: unknown) => {
    statusEl.textContent = `Failed to load ROM: ${String(error)}`;
  });
