let s = 123456789 >>> 0;

const core = (): number => {
	s += 0x6D2B79F5;
	let t = Math.imul(s ^ (s >>> 15), 1 | s);
	t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const setRandomSeed = (seed: number): void => {
	s = seed >>> 0;
};

export const random = (): number => core();
