"use strict";
var Flags;
(function (Flags) {
    Flags[Flags["Carry"] = 16] = "Carry";
    Flags[Flags["HalfCarry"] = 32] = "HalfCarry";
    Flags[Flags["Operation"] = 64] = "Operation";
    Flags[Flags["Zero"] = 128] = "Zero";
})(Flags || (Flags = {}));
class Z80 {
    constructor() {
        this._clock = { m: 0, t: 0 };
        this._r = {
            a: 0, b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0, // 8-bit registers
            pc: 0, sp: 0, // 16-bit registers
            m: 0, t: 0 // Clock for last instr
        };
    }
    // Add E to A, leaving result in A (ADD A, E)
    ADDr_e() {
        this._r.a += this._r.e; // Perform addition
        this._r.f = 0; // Clear flags
        if (!(this._r.a & 0xff))
            this._r.f |= Flags.Zero; // Check for zero
        if (this._r.a > 0xff)
            this._r.f |= Flags.Carry; // Check for carry
        this._r.a &= 0xff; // Mask to 8-bits
        this._r.m = 1;
        this._r.t = 4; // 1 M-time taken
    }
    // Compare B to A, setting flags (CP A, B)
    CPr_b() {
        let i = this._r.a; // Temp copy of A
        i -= this._r.b; // Subtract B
        this._r.f |= 0x40; // Set subtraction flag
        if (!(i & 255))
            this._r.f |= Flags.Zero; // Check for zero
        if (i < 0)
            this._r.f |= Flags.Carry; // Check for underflow
        this._r.m = 1;
        this._r.t = 4; // 1 M-time taken
    }
    // No-operation (NOP)
    NOP() {
        this._r.m = 1;
        this._r.t = 4; // 1 M-time taken
    }
}
