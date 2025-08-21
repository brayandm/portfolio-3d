export class Random {
    private s: number;
    constructor(seed: number) {
        this.s = seed >>> 0;
    }
    random(): number {
        this.s += 0x6d2b79f5;
        let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}
