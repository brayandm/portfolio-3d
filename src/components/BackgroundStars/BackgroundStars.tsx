import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Random } from "../../utils/random";

const STAR_TWINKLE_PROB = 0.1;

type BackgroundStarsProps = {
    countInner?: number;
    countOuter?: number;
    radius?: number;
    depth?: number;
    size?: number;
    innerHoleRadius?: number;
    shellThickness?: number;
    fadeRange?: number;
};

export function BackgroundStars({
    countInner = 150,
    countOuter = 850,
    radius = 60,
    depth = 40,
    size = 1,
    innerHoleRadius = 10,
    shellThickness = 0.6,
    fadeRange = 8,
}: BackgroundStarsProps) {
    const rng = useMemo(() => new Random(0), []);

    const positions = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount * 3);
        const shellR = innerHoleRadius;
        for (let i = 0; i < countInner; i++) {
            const u = rng.random();
            const v = rng.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = shellR + (rng.random() - 0.5) * shellThickness;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            arr[i * 3 + 0] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z;
        }
        const arms = 4;
        const armSeparation = (2 * Math.PI) / arms;
        const spin = 2.5;
        let w = countInner;
        const target = totalCount;
        while (w < target) {
            const r01 = Math.pow(rng.random(), 0.6);
            const r = (radius * 0.7 + depth * 1.1) * r01 + radius * 0.4;
            const arm = Math.floor(rng.random() * arms);
            const baseAngle = arm * armSeparation + r * 0.02 * spin;
            const noiseAngle = (rng.random() - 0.5) * 0.5;
            const angle = baseAngle + noiseAngle;
            const spread = 0.16 + 0.22 * (1 - r01);
            const offset = (rng.random() - 0.5) * spread * r;
            const x = Math.cos(angle) * (r + offset);
            const y = Math.sin(angle) * (r + offset);
            const z = (rng.random() - 0.5) * (radius * 0.12 + depth * 0.25) * (1 - r01);
            const d = Math.sqrt(x * x + y * y + z * z);
            if (d < innerHoleRadius) continue;
            arr[w * 3 + 0] = x;
            arr[w * 3 + 1] = y;
            arr[w * 3 + 2] = z;
            w++;
        }
        return arr;
    }, [countInner, countOuter, radius, depth, innerHoleRadius, shellThickness, rng]);

    const colors = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount * 3);
        for (let i = 0; i < totalCount; i++) {
            const r = rng.random();
            let c0: THREE.Color;
            let c1: THREE.Color;
            let whiteMixMin = 0.05;
            let whiteMixMax = 0.35;
            if (r < 0.05) {
                c0 = new THREE.Color(0.6, 0.75, 1.0);
                c1 = new THREE.Color(0.8, 0.9, 1.0);
                whiteMixMax = 0.2;
            } else if (r < 0.2) {
                c0 = new THREE.Color(1.0, 0.8, 0.55);
                c1 = new THREE.Color(1.0, 0.85, 0.65);
            } else if (r < 0.45) {
                c0 = new THREE.Color(1.0, 0.92, 0.6);
                c1 = new THREE.Color(1.0, 0.97, 0.8);
            } else if (r < 0.95) {
                c0 = new THREE.Color(0.95, 0.97, 1.0);
                c1 = new THREE.Color(1.0, 1.0, 1.0);
                whiteMixMin = 0.2;
                whiteMixMax = 0.6;
            } else {
                c0 = new THREE.Color(1.0, 0.55, 0.55);
                c1 = new THREE.Color(1.0, 0.65, 0.65);
                whiteMixMax = 0.25;
            }
            const t = rng.random();
            const base = new THREE.Color().lerpColors(c0, c1, t);
            const whiteMix =
                whiteMixMin + rng.random() * (whiteMixMax - whiteMixMin);
            const c = base.lerp(new THREE.Color(1, 1, 1), whiteMix);
            arr[i * 3 + 0] = c.r;
            arr[i * 3 + 1] = c.g;
            arr[i * 3 + 2] = c.b;
        }
        return arr;
    }, [countInner, countOuter, rng]);

    const sizes = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount);
        for (let i = 0; i < totalCount; i++) {
            const r = Math.pow(rng.random(), 3);
            arr[i] = size * (2 + r * 3);
        }
        return arr;
    }, [countInner, countOuter, size, rng]);

    const groups = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount);
        for (let i = 0; i < totalCount; i++) arr[i] = i < countInner ? 0 : 1;
        return arr;
    }, [countInner, countOuter]);

    const twinkleFlags = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount);
        for (let i = 0; i < totalCount; i++)
            arr[i] = rng.random() < STAR_TWINKLE_PROB ? 1 : 0;
        return arr;
    }, [countInner, countOuter, rng]);

    const twinklePhases = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount);
        for (let i = 0; i < totalCount; i++) arr[i] = rng.random() * Math.PI * 2;
        return arr;
    }, [countInner, countOuter, rng]);

    const twinkleSpeeds = useMemo(() => {
        const totalCount = countInner + countOuter;
        const arr = new Float32Array(totalCount);
        for (let i = 0; i < totalCount; i++) arr[i] = 0 + rng.random() * 1.2;
        return arr;
    }, [countInner, countOuter, rng]);

    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    const vertexShader = useMemo(
        () => `
        attribute float aSize;
        attribute vec3 aColor;
        attribute float aTwinkle;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aGroup;
        uniform float uTime;
        uniform float uOuterVisibility;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vGroup;
        void main() {
            vColor = aColor;
            float tw = 1.0;
            vTwinkle = tw;
            vGroup = aGroup;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
        [],
    );
    const fragmentShader = useMemo(
        () => `
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vGroup;
        uniform float uOuterVisibility;
        void main() {
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c);
            float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
            float vis = mix(1.0, uOuterVisibility, vGroup);
            alpha *= vis;
            gl_FragColor = vec4(vColor, alpha);
        }
    `,
        [],
    );

    useFrame((state) => {
        const cam = state.camera;
        const d = cam.position.length();
        const start = innerHoleRadius + fadeRange;
        const end = Math.max(0, innerHoleRadius - fadeRange);
        const vis = THREE.MathUtils.smoothstep(d, end, start);
        if (materialRef.current) {
            materialRef.current.uniforms.uOuterVisibility.value = vis;
        }
    });

    return (
        <group renderOrder={-1}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aColor"
                        args={[colors, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aSize"
                        args={[sizes, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aGroup"
                        args={[groups, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aTwinkle"
                        args={[twinkleFlags, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aPhase"
                        args={[twinklePhases, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aSpeed"
                        args={[twinkleSpeeds, 1]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    ref={materialRef}
                    args={[
                        {
                            vertexShader,
                            fragmentShader,
                            transparent: true,
                            depthWrite: false,
                            depthTest: false,
                            blending: THREE.NormalBlending,
                            uniforms: {
                                uTime: { value: 0 },
                                uOuterVisibility: { value: 1 },
                            },
                        },
                    ]}
                />
            </points>
        </group>
    );
}

