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
  })
  .catch((error: unknown) => {
    statusEl.textContent = `Failed to load ROM: ${String(error)}`;
  });
