"use strict";
var Flags;
(function (Flags) {
    Flags[Flags["Carry"] = 16] = "Carry";
    Flags[Flags["HalfCarry"] = 32] = "HalfCarry";
    Flags[Flags["Operation"] = 64] = "Operation";
    Flags[Flags["Zero"] = 128] = "Zero";
})(Flags || (Flags = {}));
class Z80 {
    constructor(gpu) {
        this._clock = { m: 0, t: 0 };
        this.regs = {
            a: 0, b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0, // 8-bit registers
            pc: 0, sp: 0, // 16-bit registers
            m: 0, t: 0, // Clock for last instr
            ime: 0,
            get hl() {
                return (this.h);
            },
        };
        this._halt = 0;
        this._stop = 0;
        this._cbmap = [];
        this._ops = {
            /*--- Load/store ---*/
            LDrr_bb: () => { this.regs.b = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_bc: () => { this.regs.b = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_bd: () => { this.regs.b = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_be: () => { this.regs.b = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_bh: () => { this.regs.b = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_bl: () => { this.regs.b = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ba: () => { this.regs.b = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_cb: () => { this.regs.c = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_cc: () => { this.regs.c = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_cd: () => { this.regs.c = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ce: () => { this.regs.c = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ch: () => { this.regs.c = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_cl: () => { this.regs.c = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ca: () => { this.regs.c = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_db: () => { this.regs.d = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_dc: () => { this.regs.d = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_dd: () => { this.regs.d = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_de: () => { this.regs.d = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_dh: () => { this.regs.d = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_dl: () => { this.regs.d = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_da: () => { this.regs.d = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_eb: () => { this.regs.e = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ec: () => { this.regs.e = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ed: () => { this.regs.e = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ee: () => { this.regs.e = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_eh: () => { this.regs.e = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_el: () => { this.regs.e = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ea: () => { this.regs.e = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_hb: () => { this.regs.h = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_hc: () => { this.regs.h = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_hd: () => { this.regs.h = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_he: () => { this.regs.h = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_hh: () => { this.regs.h = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_hl: () => { this.regs.h = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ha: () => { this.regs.h = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_lb: () => { this.regs.l = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_lc: () => { this.regs.l = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ld: () => { this.regs.l = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_le: () => { this.regs.l = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_lh: () => { this.regs.l = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ll: () => { this.regs.l = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_la: () => { this.regs.l = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ab: () => { this.regs.a = this.regs.b; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ac: () => { this.regs.a = this.regs.c; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ad: () => { this.regs.a = this.regs.d; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ae: () => { this.regs.a = this.regs.e; this.regs.m = 1; this.regs.t = 4; },
            LDrr_ah: () => { this.regs.a = this.regs.h; this.regs.m = 1; this.regs.t = 4; },
            LDrr_al: () => { this.regs.a = this.regs.l; this.regs.m = 1; this.regs.t = 4; },
            LDrr_aa: () => { this.regs.a = this.regs.a; this.regs.m = 1; this.regs.t = 4; },
            LDrHLm_b: () => { this.regs.b = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_c: () => { this.regs.c = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_d: () => { this.regs.d = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_e: () => { this.regs.e = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_h: () => { this.regs.h = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_l: () => { this.regs.l = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDrHLm_a: () => { this.regs.a = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_b: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.b); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_c: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.c); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_d: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.d); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_e: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.e); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_h: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.h); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_l: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.l); this.regs.m = 2; this.regs.t = 8; },
            LDHLmr_a: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            LDrn_b: () => { this.regs.b = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_c: () => { this.regs.c = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_d: () => { this.regs.d = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_e: () => { this.regs.e = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_h: () => { this.regs.h = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_l: () => { this.regs.l = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDrn_a: () => { this.regs.a = this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; },
            LDHLmn: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this._mmu.rb(this.regs.pc)); this.regs.pc++; this.regs.m = 3; this.regs.t = 12; },
            LDBCmA: () => { this._mmu.wb((this.regs.b << 8) + this.regs.c, this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            LDDEmA: () => { this._mmu.wb((this.regs.d << 8) + this.regs.e, this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            LDmmA: () => { this._mmu.wb(this._mmu.rw(this.regs.pc), this.regs.a); this.regs.pc += 2; this.regs.m = 4; this.regs.t = 16; },
            LDABCm: () => { this.regs.a = this._mmu.rb((this.regs.b << 8) + this.regs.c); this.regs.m = 2; this.regs.t = 8; },
            LDADEm: () => { this.regs.a = this._mmu.rb((this.regs.d << 8) + this.regs.e); this.regs.m = 2; this.regs.t = 8; },
            LDAmm: () => { this.regs.a = this._mmu.rb(this._mmu.rw(this.regs.pc)); this.regs.pc += 2; this.regs.m = 4; this.regs.t = 16; },
            LDBCnn: () => { this.regs.c = this._mmu.rb(this.regs.pc); this.regs.b = this._mmu.rb(this.regs.pc + 1); this.regs.pc += 2; this.regs.m = 3; this.regs.t = 12; },
            LDDEnn: () => { this.regs.e = this._mmu.rb(this.regs.pc); this.regs.d = this._mmu.rb(this.regs.pc + 1); this.regs.pc += 2; this.regs.m = 3; this.regs.t = 12; },
            LDHLnn: () => { this.regs.l = this._mmu.rb(this.regs.pc); this.regs.h = this._mmu.rb(this.regs.pc + 1); this.regs.pc += 2; this.regs.m = 3; this.regs.t = 12; },
            LDSPnn: () => { this.regs.sp = this._mmu.rw(this.regs.pc); this.regs.pc += 2; this.regs.m = 3; this.regs.t = 12; },
            LDHLmm: () => { var i = this._mmu.rw(this.regs.pc); this.regs.pc += 2; this.regs.l = this._mmu.rb(i); this.regs.h = this._mmu.rb(i + 1); this.regs.m = 5; this.regs.t = 20; },
            LDmmHL: () => { var i = this._mmu.rw(this.regs.pc); this.regs.pc += 2; this._mmu.ww(i, (this.regs.h << 8) + this.regs.l); this.regs.m = 5; this.regs.t = 20; },
            LDHLIA: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.a); this.regs.l = (this.regs.l + 1) & 255; if (!this.regs.l)
                this.regs.h = (this.regs.h + 1) & 255; this.regs.m = 2; this.regs.t = 8; },
            LDAHLI: () => { this.regs.a = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.l = (this.regs.l + 1) & 255; if (!this.regs.l)
                this.regs.h = (this.regs.h + 1) & 255; this.regs.m = 2; this.regs.t = 8; },
            LDHLDA: () => { this._mmu.wb((this.regs.h << 8) + this.regs.l, this.regs.a); this.regs.l = (this.regs.l - 1) & 255; if (this.regs.l == 255)
                this.regs.h = (this.regs.h - 1) & 255; this.regs.m = 2; this.regs.t = 8; },
            LDAHLD: () => { this.regs.a = this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.l = (this.regs.l - 1) & 255; if (this.regs.l == 255)
                this.regs.h = (this.regs.h - 1) & 255; this.regs.m = 2; this.regs.t = 8; },
            LDAIOn: () => { this.regs.a = this._mmu.rb(0xFF00 + this._mmu.rb(this.regs.pc)); this.regs.pc++; this.regs.m = 3; this.regs.t = 12; },
            LDIOnA: () => { this._mmu.wb(0xFF00 + this._mmu.rb(this.regs.pc), this.regs.a); this.regs.pc++; this.regs.m = 3; this.regs.t = 12; },
            LDAIOC: () => { this.regs.a = this._mmu.rb(0xFF00 + this.regs.c); this.regs.m = 2; this.regs.t = 8; },
            LDIOCA: () => { this._mmu.wb(0xFF00 + this.regs.c, this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            LDHLSPn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; i += this.regs.sp; this.regs.h = (i >> 8) & 255; this.regs.l = i & 255; this.regs.m = 3; this.regs.t = 12; },
            SWAPr_b: () => { var tr = this.regs.b; this.regs.b = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_c: () => { var tr = this.regs.c; this.regs.c = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_d: () => { var tr = this.regs.d; this.regs.d = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_e: () => { var tr = this.regs.e; this.regs.e = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_h: () => { var tr = this.regs.h; this.regs.h = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_l: () => { var tr = this.regs.l; this.regs.l = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            SWAPr_a: () => { var tr = this.regs.a; this.regs.a = this._mmu.rb((this.regs.h << 8) + this.regs.l); this._mmu.wb((this.regs.h << 8) + this.regs.l, tr); this.regs.m = 4; this.regs.t = 16; },
            /*--- Data processing ---*/
            ADDr_b: () => { this.regs.a += this.regs.b; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_c: () => { this.regs.a += this.regs.c; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_d: () => { this.regs.a += this.regs.d; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_e: () => { this.regs.a += this.regs.e; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_h: () => { this.regs.a += this.regs.h; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_l: () => { this.regs.a += this.regs.l; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDr_a: () => { this.regs.a += this.regs.a; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADDHL: () => { this.regs.a += this._mmu.rb((this.regs.h << 8) + this.regs.l); this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            ADDn: () => { this.regs.a += this._mmu.rb(this.regs.pc); this.regs.pc++; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            ADDHLBC: () => { var hl = (this.regs.h << 8) + this.regs.l; hl += (this.regs.b << 8) + this.regs.c; if (hl > 65535)
                this.regs.f |= 0x10;
            else
                this.regs.f &= 0xEF; this.regs.h = (hl >> 8) & 255; this.regs.l = hl & 255; this.regs.m = 3; this.regs.t = 12; },
            ADDHLDE: () => { var hl = (this.regs.h << 8) + this.regs.l; hl += (this.regs.d << 8) + this.regs.e; if (hl > 65535)
                this.regs.f |= 0x10;
            else
                this.regs.f &= 0xEF; this.regs.h = (hl >> 8) & 255; this.regs.l = hl & 255; this.regs.m = 3; this.regs.t = 12; },
            ADDHLHL: () => { var hl = (this.regs.h << 8) + this.regs.l; hl += (this.regs.h << 8) + this.regs.l; if (hl > 65535)
                this.regs.f |= 0x10;
            else
                this.regs.f &= 0xEF; this.regs.h = (hl >> 8) & 255; this.regs.l = hl & 255; this.regs.m = 3; this.regs.t = 12; },
            ADDHLSP: () => { var hl = (this.regs.h << 8) + this.regs.l; hl += this.regs.sp; if (hl > 65535)
                this.regs.f |= 0x10;
            else
                this.regs.f &= 0xEF; this.regs.h = (hl >> 8) & 255; this.regs.l = hl & 255; this.regs.m = 3; this.regs.t = 12; },
            ADDSPn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.sp += i; this.regs.m = 4; this.regs.t = 16; },
            ADCr_b: () => { this.regs.a += this.regs.b; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_c: () => { this.regs.a += this.regs.c; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_d: () => { this.regs.a += this.regs.d; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_e: () => { this.regs.a += this.regs.e; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_h: () => { this.regs.a += this.regs.h; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_l: () => { this.regs.a += this.regs.l; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCr_a: () => { this.regs.a += this.regs.a; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            ADCHL: () => { this.regs.a += this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            ADCn: () => { this.regs.a += this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.a += (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a); if (this.regs.a > 255)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            SUBr_b: () => { this.regs.a -= this.regs.b; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_c: () => { this.regs.a -= this.regs.c; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_d: () => { this.regs.a -= this.regs.d; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_e: () => { this.regs.a -= this.regs.e; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_h: () => { this.regs.a -= this.regs.h; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_l: () => { this.regs.a -= this.regs.l; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBr_a: () => { this.regs.a -= this.regs.a; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SUBHL: () => { this.regs.a -= this._mmu.rb((this.regs.h << 8) + this.regs.l); this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            SUBn: () => { this.regs.a -= this._mmu.rb(this.regs.pc); this.regs.pc++; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            SBCr_b: () => { this.regs.a -= this.regs.b; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_c: () => { this.regs.a -= this.regs.c; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_d: () => { this.regs.a -= this.regs.d; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_e: () => { this.regs.a -= this.regs.e; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_h: () => { this.regs.a -= this.regs.h; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_l: () => { this.regs.a -= this.regs.l; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCr_a: () => { this.regs.a -= this.regs.a; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 1; this.regs.t = 4; },
            SBCHL: () => { this.regs.a -= this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            SBCn: () => { this.regs.a -= this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.a -= (this.regs.f & 0x10) ? 1 : 0; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            CPr_b: () => { var i = this.regs.a; i -= this.regs.b; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_c: () => { var i = this.regs.a; i -= this.regs.c; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_d: () => { var i = this.regs.a; i -= this.regs.d; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_e: () => { var i = this.regs.a; i -= this.regs.e; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_h: () => { var i = this.regs.a; i -= this.regs.h; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_l: () => { var i = this.regs.a; i -= this.regs.l; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPr_a: () => { var i = this.regs.a; i -= this.regs.a; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 1; this.regs.t = 4; },
            CPHL: () => { var i = this.regs.a; i -= this._mmu.rb((this.regs.h << 8) + this.regs.l); this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 2; this.regs.t = 8; },
            CPn: () => { var i = this.regs.a; i -= this._mmu.rb(this.regs.pc); this.regs.pc++; this._ops.fz(i, 1); if (i < 0)
                this.regs.f |= 0x10; i &= 255; this.regs.m = 2; this.regs.t = 8; },
            ANDr_b: () => { this.regs.a &= this.regs.b; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_c: () => { this.regs.a &= this.regs.c; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_d: () => { this.regs.a &= this.regs.d; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_e: () => { this.regs.a &= this.regs.e; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_h: () => { this.regs.a &= this.regs.h; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_l: () => { this.regs.a &= this.regs.l; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDr_a: () => { this.regs.a &= this.regs.a; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ANDHL: () => { this.regs.a &= this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            ANDn: () => { this.regs.a &= this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            ORr_b: () => { this.regs.a |= this.regs.b; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_c: () => { this.regs.a |= this.regs.c; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_d: () => { this.regs.a |= this.regs.d; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_e: () => { this.regs.a |= this.regs.e; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_h: () => { this.regs.a |= this.regs.h; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_l: () => { this.regs.a |= this.regs.l; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORr_a: () => { this.regs.a |= this.regs.a; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            ORHL: () => { this.regs.a |= this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            ORn: () => { this.regs.a |= this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            XORr_b: () => { this.regs.a ^= this.regs.b; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_c: () => { this.regs.a ^= this.regs.c; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_d: () => { this.regs.a ^= this.regs.d; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_e: () => { this.regs.a ^= this.regs.e; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_h: () => { this.regs.a ^= this.regs.h; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_l: () => { this.regs.a ^= this.regs.l; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORr_a: () => { this.regs.a ^= this.regs.a; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            XORHL: () => { this.regs.a ^= this._mmu.rb((this.regs.h << 8) + this.regs.l); this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            XORn: () => { this.regs.a ^= this._mmu.rb(this.regs.pc); this.regs.pc++; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 2; this.regs.t = 8; },
            INCr_b: () => { this.regs.b++; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.m = 1; this.regs.t = 4; },
            INCr_c: () => { this.regs.c++; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.m = 1; this.regs.t = 4; },
            INCr_d: () => { this.regs.d++; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.m = 1; this.regs.t = 4; },
            INCr_e: () => { this.regs.e++; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.m = 1; this.regs.t = 4; },
            INCr_h: () => { this.regs.h++; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.m = 1; this.regs.t = 4; },
            INCr_l: () => { this.regs.l++; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.m = 1; this.regs.t = 4; },
            INCr_a: () => { this.regs.a++; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            INCHLm: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l) + 1; i &= 255; this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this._ops.fz(i); this.regs.m = 3; this.regs.t = 12; },
            DECr_b: () => { this.regs.b--; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.m = 1; this.regs.t = 4; },
            DECr_c: () => { this.regs.c--; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.m = 1; this.regs.t = 4; },
            DECr_d: () => { this.regs.d--; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.m = 1; this.regs.t = 4; },
            DECr_e: () => { this.regs.e--; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.m = 1; this.regs.t = 4; },
            DECr_h: () => { this.regs.h--; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.m = 1; this.regs.t = 4; },
            DECr_l: () => { this.regs.l--; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.m = 1; this.regs.t = 4; },
            DECr_a: () => { this.regs.a--; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.m = 1; this.regs.t = 4; },
            DECHLm: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l) - 1; i &= 255; this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this._ops.fz(i); this.regs.m = 3; this.regs.t = 12; },
            INCBC: () => { this.regs.c = (this.regs.c + 1) & 255; if (!this.regs.c)
                this.regs.b = (this.regs.b + 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            INCDE: () => { this.regs.e = (this.regs.e + 1) & 255; if (!this.regs.e)
                this.regs.d = (this.regs.d + 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            INCHL: () => { this.regs.l = (this.regs.l + 1) & 255; if (!this.regs.l)
                this.regs.h = (this.regs.h + 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            INCSP: () => { this.regs.sp = (this.regs.sp + 1) & 65535; this.regs.m = 1; this.regs.t = 4; },
            DECBC: () => { this.regs.c = (this.regs.c - 1) & 255; if (this.regs.c == 255)
                this.regs.b = (this.regs.b - 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            DECDE: () => { this.regs.e = (this.regs.e - 1) & 255; if (this.regs.e == 255)
                this.regs.d = (this.regs.d - 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            DECHL: () => { this.regs.l = (this.regs.l - 1) & 255; if (this.regs.l == 255)
                this.regs.h = (this.regs.h - 1) & 255; this.regs.m = 1; this.regs.t = 4; },
            DECSP: () => { this.regs.sp = (this.regs.sp - 1) & 65535; this.regs.m = 1; this.regs.t = 4; },
            /*--- Bit manipulation ---*/
            BIT0b: () => { this._ops.fz(this.regs.b & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0c: () => { this._ops.fz(this.regs.c & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0d: () => { this._ops.fz(this.regs.d & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0e: () => { this._ops.fz(this.regs.e & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0h: () => { this._ops.fz(this.regs.h & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0l: () => { this._ops.fz(this.regs.l & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0a: () => { this._ops.fz(this.regs.a & 0x01); this.regs.m = 2; this.regs.t = 8; },
            BIT0m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x01); this.regs.m = 3; this.regs.t = 12; },
            BIT1b: () => { this._ops.fz(this.regs.b & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1c: () => { this._ops.fz(this.regs.c & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1d: () => { this._ops.fz(this.regs.d & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1e: () => { this._ops.fz(this.regs.e & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1h: () => { this._ops.fz(this.regs.h & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1l: () => { this._ops.fz(this.regs.l & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1a: () => { this._ops.fz(this.regs.a & 0x02); this.regs.m = 2; this.regs.t = 8; },
            BIT1m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x02); this.regs.m = 3; this.regs.t = 12; },
            BIT2b: () => { this._ops.fz(this.regs.b & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2c: () => { this._ops.fz(this.regs.c & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2d: () => { this._ops.fz(this.regs.d & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2e: () => { this._ops.fz(this.regs.e & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2h: () => { this._ops.fz(this.regs.h & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2l: () => { this._ops.fz(this.regs.l & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2a: () => { this._ops.fz(this.regs.a & 0x04); this.regs.m = 2; this.regs.t = 8; },
            BIT2m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x04); this.regs.m = 3; this.regs.t = 12; },
            BIT3b: () => { this._ops.fz(this.regs.b & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3c: () => { this._ops.fz(this.regs.c & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3d: () => { this._ops.fz(this.regs.d & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3e: () => { this._ops.fz(this.regs.e & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3h: () => { this._ops.fz(this.regs.h & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3l: () => { this._ops.fz(this.regs.l & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3a: () => { this._ops.fz(this.regs.a & 0x08); this.regs.m = 2; this.regs.t = 8; },
            BIT3m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x08); this.regs.m = 3; this.regs.t = 12; },
            BIT4b: () => { this._ops.fz(this.regs.b & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4c: () => { this._ops.fz(this.regs.c & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4d: () => { this._ops.fz(this.regs.d & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4e: () => { this._ops.fz(this.regs.e & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4h: () => { this._ops.fz(this.regs.h & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4l: () => { this._ops.fz(this.regs.l & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4a: () => { this._ops.fz(this.regs.a & 0x10); this.regs.m = 2; this.regs.t = 8; },
            BIT4m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x10); this.regs.m = 3; this.regs.t = 12; },
            BIT5b: () => { this._ops.fz(this.regs.b & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5c: () => { this._ops.fz(this.regs.c & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5d: () => { this._ops.fz(this.regs.d & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5e: () => { this._ops.fz(this.regs.e & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5h: () => { this._ops.fz(this.regs.h & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5l: () => { this._ops.fz(this.regs.l & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5a: () => { this._ops.fz(this.regs.a & 0x20); this.regs.m = 2; this.regs.t = 8; },
            BIT5m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x20); this.regs.m = 3; this.regs.t = 12; },
            BIT6b: () => { this._ops.fz(this.regs.b & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6c: () => { this._ops.fz(this.regs.c & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6d: () => { this._ops.fz(this.regs.d & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6e: () => { this._ops.fz(this.regs.e & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6h: () => { this._ops.fz(this.regs.h & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6l: () => { this._ops.fz(this.regs.l & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6a: () => { this._ops.fz(this.regs.a & 0x40); this.regs.m = 2; this.regs.t = 8; },
            BIT6m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x40); this.regs.m = 3; this.regs.t = 12; },
            BIT7b: () => { this._ops.fz(this.regs.b & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7c: () => { this._ops.fz(this.regs.c & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7d: () => { this._ops.fz(this.regs.d & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7e: () => { this._ops.fz(this.regs.e & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7h: () => { this._ops.fz(this.regs.h & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7l: () => { this._ops.fz(this.regs.l & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7a: () => { this._ops.fz(this.regs.a & 0x80); this.regs.m = 2; this.regs.t = 8; },
            BIT7m: () => { this._ops.fz(this._mmu.rb((this.regs.h << 8) + this.regs.l) & 0x80); this.regs.m = 3; this.regs.t = 12; },
            RLA: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) + ci; this.regs.a &= 255; this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 1; this.regs.t = 4; },
            RLCA: () => { var ci = this.regs.a & 0x80 ? 1 : 0; var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) + ci; this.regs.a &= 255; this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 1; this.regs.t = 4; },
            RRA: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = (this.regs.a >> 1) + ci; this.regs.a &= 255; this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 1; this.regs.t = 4; },
            RRCA: () => { var ci = this.regs.a & 1 ? 0x80 : 0; var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = (this.regs.a >> 1) + ci; this.regs.a &= 255; this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 1; this.regs.t = 4; },
            RLr_b: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.b & 0x80 ? 0x10 : 0; this.regs.b = (this.regs.b << 1) + ci; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_c: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.c & 0x80 ? 0x10 : 0; this.regs.c = (this.regs.c << 1) + ci; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_d: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.d & 0x80 ? 0x10 : 0; this.regs.d = (this.regs.d << 1) + ci; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_e: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.e & 0x80 ? 0x10 : 0; this.regs.e = (this.regs.e << 1) + ci; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_h: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.h & 0x80 ? 0x10 : 0; this.regs.h = (this.regs.h << 1) + ci; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_l: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.l & 0x80 ? 0x10 : 0; this.regs.l = (this.regs.l << 1) + ci; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLr_a: () => { var ci = this.regs.f & 0x10 ? 1 : 0; var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) + ci; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLHL: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l); var ci = this.regs.f & 0x10 ? 1 : 0; var co = i & 0x80 ? 0x10 : 0; i = (i << 1) + ci; i &= 255; this._ops.fz(i); this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 4; this.regs.t = 16; },
            RLCr_b: () => { var ci = this.regs.b & 0x80 ? 1 : 0; var co = this.regs.b & 0x80 ? 0x10 : 0; this.regs.b = (this.regs.b << 1) + ci; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_c: () => { var ci = this.regs.c & 0x80 ? 1 : 0; var co = this.regs.c & 0x80 ? 0x10 : 0; this.regs.c = (this.regs.c << 1) + ci; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_d: () => { var ci = this.regs.d & 0x80 ? 1 : 0; var co = this.regs.d & 0x80 ? 0x10 : 0; this.regs.d = (this.regs.d << 1) + ci; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_e: () => { var ci = this.regs.e & 0x80 ? 1 : 0; var co = this.regs.e & 0x80 ? 0x10 : 0; this.regs.e = (this.regs.e << 1) + ci; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_h: () => { var ci = this.regs.h & 0x80 ? 1 : 0; var co = this.regs.h & 0x80 ? 0x10 : 0; this.regs.h = (this.regs.h << 1) + ci; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_l: () => { var ci = this.regs.l & 0x80 ? 1 : 0; var co = this.regs.l & 0x80 ? 0x10 : 0; this.regs.l = (this.regs.l << 1) + ci; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCr_a: () => { var ci = this.regs.a & 0x80 ? 1 : 0; var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) + ci; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RLCHL: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l); var ci = i & 0x80 ? 1 : 0; var co = i & 0x80 ? 0x10 : 0; i = (i << 1) + ci; i &= 255; this._ops.fz(i); this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 4; this.regs.t = 16; },
            RRr_b: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.b & 1 ? 0x10 : 0; this.regs.b = (this.regs.b >> 1) + ci; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_c: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.c & 1 ? 0x10 : 0; this.regs.c = (this.regs.c >> 1) + ci; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_d: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.d & 1 ? 0x10 : 0; this.regs.d = (this.regs.d >> 1) + ci; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_e: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.e & 1 ? 0x10 : 0; this.regs.e = (this.regs.e >> 1) + ci; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_h: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.h & 1 ? 0x10 : 0; this.regs.h = (this.regs.h >> 1) + ci; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_l: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.l & 1 ? 0x10 : 0; this.regs.l = (this.regs.l >> 1) + ci; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRr_a: () => { var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = (this.regs.a >> 1) + ci; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRHL: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l); var ci = this.regs.f & 0x10 ? 0x80 : 0; var co = i & 1 ? 0x10 : 0; i = (i >> 1) + ci; i &= 255; this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this._ops.fz(i); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 4; this.regs.t = 16; },
            RRCr_b: () => { var ci = this.regs.b & 1 ? 0x80 : 0; var co = this.regs.b & 1 ? 0x10 : 0; this.regs.b = (this.regs.b >> 1) + ci; this.regs.b &= 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_c: () => { var ci = this.regs.c & 1 ? 0x80 : 0; var co = this.regs.c & 1 ? 0x10 : 0; this.regs.c = (this.regs.c >> 1) + ci; this.regs.c &= 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_d: () => { var ci = this.regs.d & 1 ? 0x80 : 0; var co = this.regs.d & 1 ? 0x10 : 0; this.regs.d = (this.regs.d >> 1) + ci; this.regs.d &= 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_e: () => { var ci = this.regs.e & 1 ? 0x80 : 0; var co = this.regs.e & 1 ? 0x10 : 0; this.regs.e = (this.regs.e >> 1) + ci; this.regs.e &= 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_h: () => { var ci = this.regs.h & 1 ? 0x80 : 0; var co = this.regs.h & 1 ? 0x10 : 0; this.regs.h = (this.regs.h >> 1) + ci; this.regs.h &= 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_l: () => { var ci = this.regs.l & 1 ? 0x80 : 0; var co = this.regs.l & 1 ? 0x10 : 0; this.regs.l = (this.regs.l >> 1) + ci; this.regs.l &= 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCr_a: () => { var ci = this.regs.a & 1 ? 0x80 : 0; var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = (this.regs.a >> 1) + ci; this.regs.a &= 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            RRCHL: () => { var i = this._mmu.rb((this.regs.h << 8) + this.regs.l); var ci = i & 1 ? 0x80 : 0; var co = i & 1 ? 0x10 : 0; i = (i >> 1) + ci; i &= 255; this._mmu.wb((this.regs.h << 8) + this.regs.l, i); this._ops.fz(i); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 4; this.regs.t = 16; },
            SLAr_b: () => { var co = this.regs.b & 0x80 ? 0x10 : 0; this.regs.b = (this.regs.b << 1) & 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_c: () => { var co = this.regs.c & 0x80 ? 0x10 : 0; this.regs.c = (this.regs.c << 1) & 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_d: () => { var co = this.regs.d & 0x80 ? 0x10 : 0; this.regs.d = (this.regs.d << 1) & 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_e: () => { var co = this.regs.e & 0x80 ? 0x10 : 0; this.regs.e = (this.regs.e << 1) & 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_h: () => { var co = this.regs.h & 0x80 ? 0x10 : 0; this.regs.h = (this.regs.h << 1) & 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_l: () => { var co = this.regs.l & 0x80 ? 0x10 : 0; this.regs.l = (this.regs.l << 1) & 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLAr_a: () => { var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) & 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_b: () => { var co = this.regs.b & 0x80 ? 0x10 : 0; this.regs.b = (this.regs.b << 1) & 255 + 1; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_c: () => { var co = this.regs.c & 0x80 ? 0x10 : 0; this.regs.c = (this.regs.c << 1) & 255 + 1; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_d: () => { var co = this.regs.d & 0x80 ? 0x10 : 0; this.regs.d = (this.regs.d << 1) & 255 + 1; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_e: () => { var co = this.regs.e & 0x80 ? 0x10 : 0; this.regs.e = (this.regs.e << 1) & 255 + 1; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_h: () => { var co = this.regs.h & 0x80 ? 0x10 : 0; this.regs.h = (this.regs.h << 1) & 255 + 1; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_l: () => { var co = this.regs.l & 0x80 ? 0x10 : 0; this.regs.l = (this.regs.l << 1) & 255 + 1; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SLLr_a: () => { var co = this.regs.a & 0x80 ? 0x10 : 0; this.regs.a = (this.regs.a << 1) & 255 + 1; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_b: () => { var ci = this.regs.b & 0x80; var co = this.regs.b & 1 ? 0x10 : 0; this.regs.b = ((this.regs.b >> 1) + ci) & 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_c: () => { var ci = this.regs.c & 0x80; var co = this.regs.c & 1 ? 0x10 : 0; this.regs.c = ((this.regs.c >> 1) + ci) & 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_d: () => { var ci = this.regs.d & 0x80; var co = this.regs.d & 1 ? 0x10 : 0; this.regs.d = ((this.regs.d >> 1) + ci) & 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_e: () => { var ci = this.regs.e & 0x80; var co = this.regs.e & 1 ? 0x10 : 0; this.regs.e = ((this.regs.e >> 1) + ci) & 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_h: () => { var ci = this.regs.h & 0x80; var co = this.regs.h & 1 ? 0x10 : 0; this.regs.h = ((this.regs.h >> 1) + ci) & 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_l: () => { var ci = this.regs.l & 0x80; var co = this.regs.l & 1 ? 0x10 : 0; this.regs.l = ((this.regs.l >> 1) + ci) & 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRAr_a: () => { var ci = this.regs.a & 0x80; var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = ((this.regs.a >> 1) + ci) & 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_b: () => { var co = this.regs.b & 1 ? 0x10 : 0; this.regs.b = (this.regs.b >> 1) & 255; this._ops.fz(this.regs.b); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_c: () => { var co = this.regs.c & 1 ? 0x10 : 0; this.regs.c = (this.regs.c >> 1) & 255; this._ops.fz(this.regs.c); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_d: () => { var co = this.regs.d & 1 ? 0x10 : 0; this.regs.d = (this.regs.d >> 1) & 255; this._ops.fz(this.regs.d); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_e: () => { var co = this.regs.e & 1 ? 0x10 : 0; this.regs.e = (this.regs.e >> 1) & 255; this._ops.fz(this.regs.e); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_h: () => { var co = this.regs.h & 1 ? 0x10 : 0; this.regs.h = (this.regs.h >> 1) & 255; this._ops.fz(this.regs.h); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_l: () => { var co = this.regs.l & 1 ? 0x10 : 0; this.regs.l = (this.regs.l >> 1) & 255; this._ops.fz(this.regs.l); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            SRLr_a: () => { var co = this.regs.a & 1 ? 0x10 : 0; this.regs.a = (this.regs.a >> 1) & 255; this._ops.fz(this.regs.a); this.regs.f = (this.regs.f & 0xEF) + co; this.regs.m = 2; this.regs.t = 8; },
            CPL: () => { this.regs.a = (~this.regs.a) & 255; this._ops.fz(this.regs.a, 1); this.regs.m = 1; this.regs.t = 4; },
            NEG: () => { this.regs.a = 0 - this.regs.a; this._ops.fz(this.regs.a, 1); if (this.regs.a < 0)
                this.regs.f |= 0x10; this.regs.a &= 255; this.regs.m = 2; this.regs.t = 8; },
            CCF: () => { var ci = this.regs.f & 0x10 ? 0 : 0x10; this.regs.f = (this.regs.f & 0xEF) + ci; this.regs.m = 1; this.regs.t = 4; },
            SCF: () => { this.regs.f |= 0x10; this.regs.m = 1; this.regs.t = 4; },
            /*--- Stack ---*/
            PUSHBC: () => { this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.b); this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.c); this.regs.m = 3; this.regs.t = 12; },
            PUSHDE: () => { this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.d); this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.e); this.regs.m = 3; this.regs.t = 12; },
            PUSHHL: () => { this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.h); this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.l); this.regs.m = 3; this.regs.t = 12; },
            PUSHAF: () => { this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.a); this.regs.sp--; this._mmu.wb(this.regs.sp, this.regs.f); this.regs.m = 3; this.regs.t = 12; },
            POPBC: () => { this.regs.c = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.b = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.m = 3; this.regs.t = 12; },
            POPDE: () => { this.regs.e = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.d = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.m = 3; this.regs.t = 12; },
            POPHL: () => { this.regs.l = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.h = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.m = 3; this.regs.t = 12; },
            POPAF: () => { this.regs.f = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.a = this._mmu.rb(this.regs.sp); this.regs.sp++; this.regs.m = 3; this.regs.t = 12; },
            /*--- Jump ---*/
            JPnn: () => { this.regs.pc = this._mmu.rw(this.regs.pc); this.regs.m = 3; this.regs.t = 12; },
            JPHL: () => { this.regs.pc = this.regs.hl; this.regs.m = 1; this.regs.t = 4; },
            JPNZnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x80) == 0x00) {
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m++;
                this.regs.t += 4;
            }
            else
                this.regs.pc += 2; },
            JPZnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x80) == 0x80) {
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m++;
                this.regs.t += 4;
            }
            else
                this.regs.pc += 2; },
            JPNCnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x10) == 0x00) {
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m++;
                this.regs.t += 4;
            }
            else
                this.regs.pc += 2; },
            JPCnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x10) == 0x10) {
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m++;
                this.regs.t += 4;
            }
            else
                this.regs.pc += 2; },
            JRn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; this.regs.pc += i; this.regs.m++; this.regs.t += 4; },
            JRNZn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; if ((this.regs.f & 0x80) == 0x00) {
                this.regs.pc += i;
                this.regs.m++;
                this.regs.t += 4;
            } },
            JRZn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; if ((this.regs.f & 0x80) == 0x80) {
                this.regs.pc += i;
                this.regs.m++;
                this.regs.t += 4;
            } },
            JRNCn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; if ((this.regs.f & 0x10) == 0x00) {
                this.regs.pc += i;
                this.regs.m++;
                this.regs.t += 4;
            } },
            JRCn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; if ((this.regs.f & 0x10) == 0x10) {
                this.regs.pc += i;
                this.regs.m++;
                this.regs.t += 4;
            } },
            DJNZn: () => { var i = this._mmu.rb(this.regs.pc); if (i > 127)
                i = -((~i + 1) & 255); this.regs.pc++; this.regs.m = 2; this.regs.t = 8; this.regs.b--; if (this.regs.b) {
                this.regs.pc += i;
                this.regs.m++;
                this.regs.t += 4;
            } },
            CALLnn: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc + 2); this.regs.pc = this._mmu.rw(this.regs.pc); this.regs.m = 5; this.regs.t = 20; },
            CALLNZnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x80) == 0x00) {
                this.regs.sp -= 2;
                this._mmu.ww(this.regs.sp, this.regs.pc + 2);
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m += 2;
                this.regs.t += 8;
            }
            else
                this.regs.pc += 2; },
            CALLZnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x80) == 0x80) {
                this.regs.sp -= 2;
                this._mmu.ww(this.regs.sp, this.regs.pc + 2);
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m += 2;
                this.regs.t += 8;
            }
            else
                this.regs.pc += 2; },
            CALLNCnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x10) == 0x00) {
                this.regs.sp -= 2;
                this._mmu.ww(this.regs.sp, this.regs.pc + 2);
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m += 2;
                this.regs.t += 8;
            }
            else
                this.regs.pc += 2; },
            CALLCnn: () => { this.regs.m = 3; this.regs.t = 12; if ((this.regs.f & 0x10) == 0x10) {
                this.regs.sp -= 2;
                this._mmu.ww(this.regs.sp, this.regs.pc + 2);
                this.regs.pc = this._mmu.rw(this.regs.pc);
                this.regs.m += 2;
                this.regs.t += 8;
            }
            else
                this.regs.pc += 2; },
            RET: () => { this.regs.pc = this._mmu.rw(this.regs.sp); this.regs.sp += 2; this.regs.m = 3; this.regs.t = 12; },
            RETI: () => { this.regs.ime = 1; this.regs.pc = this._mmu.rw(this.regs.sp); this.regs.sp += 2; this.regs.m = 3; this.regs.t = 12; },
            RETNZ: () => { this.regs.m = 1; this.regs.t = 4; if ((this.regs.f & 0x80) == 0x00) {
                this.regs.pc = this._mmu.rw(this.regs.sp);
                this.regs.sp += 2;
                this.regs.m += 2;
                this.regs.t += 8;
            } },
            RETZ: () => { this.regs.m = 1; this.regs.t = 4; if ((this.regs.f & 0x80) == 0x80) {
                this.regs.pc = this._mmu.rw(this.regs.sp);
                this.regs.sp += 2;
                this.regs.m += 2;
                this.regs.t += 8;
            } },
            RETNC: () => { this.regs.m = 1; this.regs.t = 4; if ((this.regs.f & 0x10) == 0x00) {
                this.regs.pc = this._mmu.rw(this.regs.sp);
                this.regs.sp += 2;
                this.regs.m += 2;
                this.regs.t += 8;
            } },
            RETC: () => { this.regs.m = 1; this.regs.t = 4; if ((this.regs.f & 0x10) == 0x10) {
                this.regs.pc = this._mmu.rw(this.regs.sp);
                this.regs.sp += 2;
                this.regs.m += 2;
                this.regs.t += 8;
            } },
            RST00: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x00; this.regs.m = 3; this.regs.t = 12; },
            RST08: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x08; this.regs.m = 3; this.regs.t = 12; },
            RST10: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x10; this.regs.m = 3; this.regs.t = 12; },
            RST18: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x18; this.regs.m = 3; this.regs.t = 12; },
            RST20: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x20; this.regs.m = 3; this.regs.t = 12; },
            RST28: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x28; this.regs.m = 3; this.regs.t = 12; },
            RST30: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x30; this.regs.m = 3; this.regs.t = 12; },
            RST38: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x38; this.regs.m = 3; this.regs.t = 12; },
            RST40: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x40; this.regs.m = 3; this.regs.t = 12; },
            RST48: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x48; this.regs.m = 3; this.regs.t = 12; },
            RST50: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x50; this.regs.m = 3; this.regs.t = 12; },
            RST58: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x58; this.regs.m = 3; this.regs.t = 12; },
            RST60: () => { this.regs.sp -= 2; this._mmu.ww(this.regs.sp, this.regs.pc); this.regs.pc = 0x60; this.regs.m = 3; this.regs.t = 12; },
            NOP: () => { this.regs.m = 1; this.regs.t = 4; },
            HALT: () => { this._halt = 1; this.regs.m = 1; this.regs.t = 4; },
            DI: () => { this.regs.ime = 0; this.regs.m = 1; this.regs.t = 4; },
            EI: () => { this.regs.ime = 1; this.regs.m = 1; this.regs.t = 4; },
            /*--- Helper functions ---*/
            fz: (i, as) => { this.regs.f = 0; if (!(i & 255))
                this.regs.f |= 128; this.regs.f |= as ? 0x40 : 0; },
            MAPcb: () => {
                var i = this._mmu.rb(this.regs.pc);
                this.regs.pc++;
                this.regs.pc &= 65535;
                if (this._cbmap[i])
                    this._cbmap[i]();
                else
                    alert(i);
            },
            XX: () => {
                /*Undefined map entry*/
                var opc = this.regs.pc - 1;
                alert('Unimplemented instruction at $' + opc.toString(16) + ', stopping.');
                this._stop = 1;
            }
        };
        this._map = [
            // 00
            this._ops.NOP,
            this._ops.LDBCnn,
            this._ops.LDBCmA,
            this._ops.INCBC,
            this._ops.INCr_b,
            this._ops.DECr_b,
            this._ops.LDrn_b,
            this._ops.RLCA,
            this._ops.XX, //WTF IS THIS??? this._ops.LDmmSP,
            this._ops.ADDHLBC,
            this._ops.LDABCm,
            this._ops.DECBC,
            this._ops.INCr_c,
            this._ops.DECr_c,
            this._ops.LDrn_c,
            this._ops.RRCA,
            // 10
            this._ops.DJNZn,
            this._ops.LDDEnn,
            this._ops.LDDEmA,
            this._ops.INCDE,
            this._ops.INCr_d,
            this._ops.DECr_d,
            this._ops.LDrn_d,
            this._ops.RLA,
            this._ops.JRn,
            this._ops.ADDHLDE,
            this._ops.LDADEm,
            this._ops.DECDE,
            this._ops.INCr_e,
            this._ops.DECr_e,
            this._ops.LDrn_e,
            this._ops.RRA,
            // 20
            this._ops.JRNZn,
            this._ops.LDHLnn,
            this._ops.LDHLIA,
            this._ops.INCHL,
            this._ops.INCr_h,
            this._ops.DECr_h,
            this._ops.LDrn_h,
            this._ops.XX,
            this._ops.JRZn,
            this._ops.ADDHLHL,
            this._ops.LDAHLI,
            this._ops.DECHL,
            this._ops.INCr_l,
            this._ops.DECr_l,
            this._ops.LDrn_l,
            this._ops.CPL,
            // 30
            this._ops.JRNCn,
            this._ops.LDSPnn,
            this._ops.LDHLDA,
            this._ops.INCSP,
            this._ops.INCHLm,
            this._ops.DECHLm,
            this._ops.LDHLmn,
            this._ops.SCF,
            this._ops.JRCn,
            this._ops.ADDHLSP,
            this._ops.LDAHLD,
            this._ops.DECSP,
            this._ops.INCr_a,
            this._ops.DECr_a,
            this._ops.LDrn_a,
            this._ops.CCF,
            // 40
            this._ops.LDrr_bb,
            this._ops.LDrr_bc,
            this._ops.LDrr_bd,
            this._ops.LDrr_be,
            this._ops.LDrr_bh,
            this._ops.LDrr_bl,
            this._ops.LDrHLm_b,
            this._ops.LDrr_ba,
            this._ops.LDrr_cb,
            this._ops.LDrr_cc,
            this._ops.LDrr_cd,
            this._ops.LDrr_ce,
            this._ops.LDrr_ch,
            this._ops.LDrr_cl,
            this._ops.LDrHLm_c,
            this._ops.LDrr_ca,
            // 50
            this._ops.LDrr_db,
            this._ops.LDrr_dc,
            this._ops.LDrr_dd,
            this._ops.LDrr_de,
            this._ops.LDrr_dh,
            this._ops.LDrr_dl,
            this._ops.LDrHLm_d,
            this._ops.LDrr_da,
            this._ops.LDrr_eb,
            this._ops.LDrr_ec,
            this._ops.LDrr_ed,
            this._ops.LDrr_ee,
            this._ops.LDrr_eh,
            this._ops.LDrr_el,
            this._ops.LDrHLm_e,
            this._ops.LDrr_ea,
            // 60
            this._ops.LDrr_hb,
            this._ops.LDrr_hc,
            this._ops.LDrr_hd,
            this._ops.LDrr_he,
            this._ops.LDrr_hh,
            this._ops.LDrr_hl,
            this._ops.LDrHLm_h,
            this._ops.LDrr_ha,
            this._ops.LDrr_lb,
            this._ops.LDrr_lc,
            this._ops.LDrr_ld,
            this._ops.LDrr_le,
            this._ops.LDrr_lh,
            this._ops.LDrr_ll,
            this._ops.LDrHLm_l,
            this._ops.LDrr_la,
            // 70
            this._ops.LDHLmr_b,
            this._ops.LDHLmr_c,
            this._ops.LDHLmr_d,
            this._ops.LDHLmr_e,
            this._ops.LDHLmr_h,
            this._ops.LDHLmr_l,
            this._ops.HALT,
            this._ops.LDHLmr_a,
            this._ops.LDrr_ab,
            this._ops.LDrr_ac,
            this._ops.LDrr_ad,
            this._ops.LDrr_ae,
            this._ops.LDrr_ah,
            this._ops.LDrr_al,
            this._ops.LDrHLm_a,
            this._ops.LDrr_aa,
            // 80
            this._ops.ADDr_b,
            this._ops.ADDr_c,
            this._ops.ADDr_d,
            this._ops.ADDr_e,
            this._ops.ADDr_h,
            this._ops.ADDr_l,
            this._ops.ADDHL,
            this._ops.ADDr_a,
            this._ops.ADCr_b,
            this._ops.ADCr_c,
            this._ops.ADCr_d,
            this._ops.ADCr_e,
            this._ops.ADCr_h,
            this._ops.ADCr_l,
            this._ops.ADCHL,
            this._ops.ADCr_a,
            // 90
            this._ops.SUBr_b,
            this._ops.SUBr_c,
            this._ops.SUBr_d,
            this._ops.SUBr_e,
            this._ops.SUBr_h,
            this._ops.SUBr_l,
            this._ops.SUBHL,
            this._ops.SUBr_a,
            this._ops.SBCr_b,
            this._ops.SBCr_c,
            this._ops.SBCr_d,
            this._ops.SBCr_e,
            this._ops.SBCr_h,
            this._ops.SBCr_l,
            this._ops.SBCHL,
            this._ops.SBCr_a,
            // A0
            this._ops.ANDr_b,
            this._ops.ANDr_c,
            this._ops.ANDr_d,
            this._ops.ANDr_e,
            this._ops.ANDr_h,
            this._ops.ANDr_l,
            this._ops.ANDHL,
            this._ops.ANDr_a,
            this._ops.XORr_b,
            this._ops.XORr_c,
            this._ops.XORr_d,
            this._ops.XORr_e,
            this._ops.XORr_h,
            this._ops.XORr_l,
            this._ops.XORHL,
            this._ops.XORr_a,
            // B0
            this._ops.ORr_b,
            this._ops.ORr_c,
            this._ops.ORr_d,
            this._ops.ORr_e,
            this._ops.ORr_h,
            this._ops.ORr_l,
            this._ops.ORHL,
            this._ops.ORr_a,
            this._ops.CPr_b,
            this._ops.CPr_c,
            this._ops.CPr_d,
            this._ops.CPr_e,
            this._ops.CPr_h,
            this._ops.CPr_l,
            this._ops.CPHL,
            this._ops.CPr_a,
            // C0
            this._ops.RETNZ,
            this._ops.POPBC,
            this._ops.JPNZnn,
            this._ops.JPnn,
            this._ops.CALLNZnn,
            this._ops.PUSHBC,
            this._ops.ADDn,
            this._ops.RST00,
            this._ops.RETZ,
            this._ops.RET,
            this._ops.JPZnn,
            this._ops.MAPcb,
            this._ops.CALLZnn,
            this._ops.CALLnn,
            this._ops.ADCn,
            this._ops.RST08,
            // D0
            this._ops.RETNC,
            this._ops.POPDE,
            this._ops.JPNCnn,
            this._ops.XX,
            this._ops.CALLNCnn,
            this._ops.PUSHDE,
            this._ops.SUBn,
            this._ops.RST10,
            this._ops.RETC,
            this._ops.RETI,
            this._ops.JPCnn,
            this._ops.XX,
            this._ops.CALLCnn,
            this._ops.XX,
            this._ops.SBCn,
            this._ops.RST18,
            // E0
            this._ops.LDIOnA,
            this._ops.POPHL,
            this._ops.LDIOCA,
            this._ops.XX,
            this._ops.XX,
            this._ops.PUSHHL,
            this._ops.ANDn,
            this._ops.RST20,
            this._ops.ADDSPn,
            this._ops.JPHL,
            this._ops.LDmmA,
            this._ops.XX,
            this._ops.XX,
            this._ops.XX,
            this._ops.ORn,
            this._ops.RST28,
            // F0
            this._ops.LDAIOn,
            this._ops.POPAF,
            this._ops.LDAIOC,
            this._ops.DI,
            this._ops.XX,
            this._ops.PUSHAF,
            this._ops.XORn,
            this._ops.RST30,
            this._ops.LDHLSPn,
            this._ops.XX,
            this._ops.LDAmm,
            this._ops.EI,
            this._ops.XX,
            this._ops.XX,
            this._ops.CPn,
            this._ops.RST38
        ];
        this._gpu = gpu;
        this._mmu = new MMU(gpu, this);
        this.reset();
        for (let y = 0; y < gpu.height; y++) {
            for (let x = 0; x < gpu.width; x++) {
                const r = Math.floor((x / gpu.width) * 255);
                const g = Math.floor((y / gpu.height) * 255);
                const b = 128;
                gpu.setPixel(x, y, r, g, b);
            }
        }
        gpu.refresh();
    }
    loadRom(romFile) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(romFile);
        reader.onerror = () => {
            console.log(reader.error);
        };
        reader.onload = () => {
            console.log(`Load file '${romFile === null || romFile === void 0 ? void 0 : romFile.name}' success.`);
            const romByteArray = Array.from(new Uint8Array(reader.result));
            this._mmu._rom = romByteArray;
        };
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
    step() {
        let op = this._mmu.rb(this.regs.pc);
        this.regs.pc++;
        this._map[op]();
        this.regs.pc &= 0xffff;
        this._clock.m += this.regs.m;
        this._clock.t += this.regs.t;
    }
}
