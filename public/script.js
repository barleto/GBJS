"use strict";
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
    let fileInput = undefined;
    const gpu = new GPU("screen");
    const z80 = new Z80(gpu);
    (_a = document.getElementById("fileInput")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", (event) => {
        fileInput = event.target.files[0];
    });
    (_b = document.getElementById("loadRomButton")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        if (!fileInput) {
            alert("No file selected.");
            return;
        }
        startEmulation(fileInput);
    });
    function startEmulation(romFile) {
        z80.loadRom(romFile);
    }
});
