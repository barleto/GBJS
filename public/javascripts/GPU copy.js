"use strict";
class GPUClass {
    get height() { return this._screen.height; }
    ;
    get width() { return this._screen.width; }
    ;
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        this._canvasCtx = canvas.getContext("2d");
        this._screen = this._canvasCtx.createImageData(160, 144);
    }
    setPixel(x, y, r, g, b, a = 255) {
        const index = (y * this._screen.width + x) * 4;
        this._screen.data[index] = r; // Red
        this._screen.data[index + 1] = g; // Green
        this._screen.data[index + 2] = b; // Blue
        this._screen.data[index + 3] = a; // Alpha
    }
    refresh() {
        this._canvasCtx.putImageData(this._screen, 0, 0);
    }
}
