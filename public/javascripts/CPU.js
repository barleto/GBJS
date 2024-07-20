"use strict";
var Flags;
(function (Flags) {
    Flags[Flags["Carry"] = 16] = "Carry";
    Flags[Flags["HalfCarry"] = 32] = "HalfCarry";
    Flags[Flags["Operation"] = 64] = "Operation";
    Flags[Flags["Zero"] = 128] = "Zero";
})(Flags || (Flags = {}));
class Z80 {
    constructor(gpu, mmu) {
        this._clock = { m: 0, t: 0 };
        this.regs = {
            a: 0, b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0, // 8-bit registers
            pc: 0, sp: 0, // 16-bit registers
            m: 0, t: 0 // Clock for last instr
        };
        this._ops = {
            /** Add E to A, leaving result in A (ADD A, E) */
            ADDr_e: () => {
                this.regs.a += this.regs.e; // Perform addition
                this.regs.f = 0; // Clear flags
                if (!(this.regs.a & 0xff))
                    this.regs.f |= Flags.Zero; // Check for zero
                if (this.regs.a > 0xff)
                    this.regs.f |= Flags.Carry; // Check for carry
                this.regs.a &= 0xff; // Mask to 8-bits
                this.regs.m = 1;
                this.regs.t = 4; // 1 M-time taken
            },
            /** Compare B to A, setting flags (CP A, B) */
            CPr_b: () => {
                let i = this.regs.a; // Temp copy of A
                i -= this.regs.b; // Subtract B
                this.regs.f |= 0x40; // Set subtraction flag
                if (!(i & 255))
                    this.regs.f |= Flags.Zero; // Check for zero
                if (i < 0)
                    this.regs.f |= Flags.Carry; // Check for underflow
                this.regs.m = 1;
                this.regs.t = 4; // 1 M-time taken
            },
            /** No-operation (NOP) */
            NOP: () => {
                this.regs.m = 1;
                this.regs.t = 4; // 1 M-time taken
            },
            /** Push registers B and C to the stack (PUSH BC) */
            PUSHBC: () => {
                this.regs.sp--; // Drop through the stack
                this._mmu.wb(this.regs.sp, this.regs.b); // Write B
                this.regs.sp--; // Drop through the stack
                this._mmu.wb(this.regs.sp, this.regs.c); // Write C
                this.regs.m = 3;
                this.regs.t = 12; // 3 M-times taken
            },
            /** Pop registers H and L off the stack (POP HL) */
            POPHL: () => {
                this.regs.l = this._mmu.rb(this.regs.sp); // Read L
                this.regs.sp++; // Move back up the stack
                this.regs.h = this._mmu.rb(this.regs.sp); // Read H
                this.regs.sp++; // Move back up the stack
                this.regs.m = 3;
                this.regs.t = 12; // 3 M-times taken
            },
            /** Read a byte from absolute location into A (LD A, addr) */
            LDAmm: () => {
                var addr = this._mmu.rw(this.regs.pc); // Get address from instr
                this.regs.pc += 2; // Advance PC
                this.regs.a = this._mmu.rb(addr); // Read from address
                this.regs.m = 4;
                this.regs.t = 16; // 4 M-times taken
            },
        };
        this._gpu = gpu;
        this._mmu = mmu;
        this.reset();
    }
    reset() {
        this.regs.a = 0;
        this.regs.b = 0;
        this.regs.c = 0;
        this.regs.d = 0;
        this.regs.e = 0;
        this.regs.h = 0;
        this.regs.l = 0;
        this.regs.f = 0;
        this.regs.sp = 0;
        this.regs.pc = 0; // Start execution at 0
        this._clock.m = 0;
        this._clock.t = 0;
    }
    tick() {
        let op = this._mmu.rb(this.regs.pc);
        this.regs.pc++;
        //HERE
        this.regs.pc &= 0xffff;
        this._clock.m += this.regs.m;
        this._clock.t += this.regs.t;
    }
}
