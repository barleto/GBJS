class GPU {
    private _screen!: ImageData;
    private _canvasCtx: CanvasRenderingContext2D;
    public get height(): number { return this._screen.height};
    public get width(): number { return this._screen.width};

    public vram: number[] = [];
    public oam: number[] = [];
    

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId);
        this._canvasCtx = (canvas as HTMLCanvasElement).getContext("2d")!;
        this._screen = this._canvasCtx.createImageData(160, 144);
    }

    setPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
        const index = (y * this._screen.width + x) * 4;
        this._screen.data[index] = r;     // Red
        this._screen.data[index + 1] = g; // Green
        this._screen.data[index + 2] = b; // Blue
        this._screen.data[index + 3] = a; // Alpha
    }

    refresh() {
        this._canvasCtx.putImageData(this._screen, 0, 0)
    }
}