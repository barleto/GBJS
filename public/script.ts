
document.addEventListener('DOMContentLoaded', () => {
    let fileInput: File | undefined = undefined;
    
    const gpu = new GPU("screen");
    const z80 = new Z80(gpu);

    document.getElementById("fileInput")?.addEventListener("change", (event: any) => {
        fileInput = event.target.files[0];
    });

    

    document.getElementById("loadRomButton")?.addEventListener("click", () => {
        if (!fileInput) {
            alert("No file selected.");
            return;
        }
        startEmulation(fileInput);
    });

    function startEmulation(romFile: File) {
        z80.loadRom(romFile);
    }

});