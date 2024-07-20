/**
The gameboy is a 16-bit device, meaning ti can access only 65536 individual addresses for memory (0xffff).
Its memory address space is separated in regions that map different parts of the hardware. Thusm a "Memory map"
can be drawn:
                                                                                                 
0k____________16k_________32K_________40k_________48k__________ _  _64k                                    
|  |           |           |           |           |           | || |→ I/O                                                           
|  | ROM       | ROM       | GPU       | Ext.      | Working   | ||_|                                         
|  | Bank 0    | Bank 1    | VRAM      | RAM       | RAM       | || |                                   
|__|_____8k____|____24k____|_____8k____|_____8k____|____56k____|_||_|→ ZRAM                                                    
  ↓                                                             ↓                                     
 BIOS                                                 sprite attributes       
                                            
Regions details:
- [0000-3FFF] Cartridge ROM, bank 0: The first 16,384 bytes of the cartridge program are always available at 
    this point in the memory map. Special circumstances apply:
- [0000-00FF] BIOS: When the CPU starts up, PC starts at 0000h, which is the start of the 256-byte GameBoy 
    BIOS code. Once the BIOS has run, it is removed from the memory map, and this area of the cartridge rom becomes addressable.
- [0100-014F] Cartridge header: This section of the cartridge contains data about its name and manufacturer, 
    and must be written in a specific format.
- [4000-7FFF] Cartridge ROM, other banks: Any subsequent 16k "banks" of the cartridge program can be made 
    available to the CPU here, one by one; a chip on the cartridge is generally used to switch between banks, 
    and make a particular area accessible. The smallest programs are 32k, which means that no bank-selection chip is required.
- [8000-9FFF] Graphics RAM: Data required for the backgrounds and sprites used by the graphics subsystem is 
    held here, and can be changed by the cartridge program. This region will be examined in further detail in part 3 of this series.
- [A000-BFFF] Cartridge (External) RAM: There is a small amount of writeable memory available in the GameBoy; 
    if a game is produced that requires more RAM than is available in the hardware, additional 8k chunks of RAM can be made addressable here.
- [C000-DFFF] Working RAM: The GameBoy's internal 8k of RAM, which can be read from or written to by the CPU.
- [E000-FDFF] Working RAM (shadow): Due to the wiring of the GameBoy hardware, an exact copy of the working 
    RAM is available 8k higher in the memory map. This copy is available up until the last 512 bytes of the map, where other areas are brought into access.
- [FE00-FE9F] Graphics: sprite information: Data about the sprites rendered by the graphics chip are held 
    here, including the sprites' positions and attributes.
- [FF00-FF7F] Memory-mapped I/O: Each of the GameBoy's subsystems (graphics, sound, etc.) has control values, 
    to allow programs to create effects and use the hardware. These values are available to the CPU directly on the address bus, in this area.
- [FF80-FFFF] Zero-page RAM: A high-speed area of 128 bytes of RAM is available at the top of memory. Oddly, 
    though this is "page" 255 of the memory, it is referred to as page zero, since most of the interaction between the program 
    and the GameBoy hardware occurs through use of this page of memory.
 */

class MMU {

    // Flag indicating BIOS is mapped in
    // BIOS is unmapped with the first instruction above 0x00FF
    _inbios = true;

    // Memory regions (initialised at reset time)
    _bios: number[] = [];
    _rom: number[] = [];
    _wram: number[] = [];
    _eram: number[] = [];
    _zram: number[] = [];

    private _gpu: GPU;
    private _cpu: Z80;

    constructor(gpu: GPU, cpu: Z80) {
        this._gpu = gpu;
        this._cpu = cpu;
    }

    /**
     * Read 8-bit byte from a given address 
     * @param addr
     * @param val 
     */
    rb(addr: number): number {
        switch (addr & 0xF000) {
            // BIOS (256b)/ROM0
            case 0x0000:
                if (this._inbios) {
                    if (addr < 0x0100)
                        return this._bios[addr];
                    else if (this._cpu.regs.pc == 0x0100)
                        this._inbios = false;
                }

                return this._rom[addr];

            // ROM0
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this._rom[addr];

            // ROM1 (unbanked) (16k)
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                return this._rom[addr];

            // Graphics: VRAM (8k)
            case 0x8000:
            case 0x9000:
                return this._gpu.vram[addr & 0x1FFF];

            // External RAM (8k)
            case 0xA000:
            case 0xB000:
                return this._eram[addr & 0x1FFF];

            // Working RAM (8k)
            case 0xC000:
            case 0xD000:
                return this._wram[addr & 0x1FFF];

            // Working RAM shadow
            case 0xE000:
                return this._wram[addr & 0x1FFF];

            // Working RAM shadow, I/O, Zero-page RAM
            case 0xF000:
                switch (addr & 0x0F00) {
                    // Working RAM shadow
                    case 0x000: case 0x100: case 0x200: case 0x300:
                    case 0x400: case 0x500: case 0x600: case 0x700:
                    case 0x800: case 0x900: case 0xA00: case 0xB00:
                    case 0xC00: case 0xD00:
                        return this._wram[addr & 0x1FFF];

                    // Graphics: object attribute memory
                    // OAM is 160 bytes, remaining bytes read as 0
                    case 0xE00:
                        if (addr < 0xFEA0)
                            return this._gpu.oam[addr & 0xFF];
                        else
                            return 0;

                    // Zero-page
                    case 0xF00:
                        if (addr >= 0xFF80) {
                            return this._zram[addr & 0x7F];
                        }
                        else {
                            // I/O control handling
                            // Currently unhandled
                            return 0;
                        }
                }
        }
        return 0x00;
    }

    /**
     * Read 16-bit word from a given address 
     * @param addr
     * @param val 
     */
    rw(addr: number): number {
        return 0xff;
    }


    /**
     * Write 8-bit byte to a given address 
     * @param addr
     * @param val 
     */
    wb(addr: number, val: number) {

    }

    /**
     * Write 16-bit word to a given address 
     * @param addr
     * @param val 
     */
    ww(addr: number, val: number) {

    }

}