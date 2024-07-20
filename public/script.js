"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const gpu = new GPU("screen");
    for (let y = 0; y < gpu.height; y++) {
        for (let x = 0; x < gpu.width; x++) {
            const r = Math.floor((x / gpu.width) * 255);
            const g = Math.floor((y / gpu.height) * 255);
            const b = 128;
            gpu.setPixel(x, y, r, g, b);
        }
    }
    console.log("AAAAAAA");
    gpu.refresh();
});
