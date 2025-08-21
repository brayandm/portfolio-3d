import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundStarsProps = {
    count?: number;
    radius?: number;
    depth?: number;
    size?: number;
    rotationSpeed?: number;
};

export function BackgroundStars({
    count = 1000,
    radius = 60,
    depth = 40,
    size = 1,
    rotationSpeed = 0.02,
}: BackgroundStarsProps) {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = radius + Math.random() * depth;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            arr[i * 3 + 0] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z;
        }
        return arr;
    }, [count, radius, depth]);

    const colors = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = Math.random();
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
            const t = Math.random();
            const base = new THREE.Color().lerpColors(c0, c1, t);
            const whiteMix =
                whiteMixMin + Math.random() * (whiteMixMax - whiteMixMin);
            const c = base.lerp(new THREE.Color(1, 1, 1), whiteMix);
            arr[i * 3 + 0] = c.r;
            arr[i * 3 + 1] = c.g;
            arr[i * 3 + 2] = c.b;
        }
        return arr;
    }, [count]);

    const sizes = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = Math.pow(Math.random(), 3);
            arr[i] = size * (0.6 + r * 3.4);
        }
        return arr;
    }, [count, size]);

    const groupRef = useRef<THREE.Group>(null!);
    useFrame((_, delta) => {
        if (groupRef.current)
            groupRef.current.rotation.y += rotationSpeed * delta;
    });

    const vertexShader = useMemo(
        () => `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        void main() {
            vColor = aColor;
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
        void main() {
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c);
            float alpha = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, alpha);
        }
    `,
        [],
    );

    return (
        <group ref={groupRef} renderOrder={-1}>
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
                </bufferGeometry>
                <shaderMaterial
                    args={[
                        {
                            vertexShader,
                            fragmentShader,
                            transparent: true,
                            depthWrite: false,
                            depthTest: false,
                            blending: THREE.NormalBlending,
                        },
                    ]}
                />
            </points>
        </group>
    );
}
