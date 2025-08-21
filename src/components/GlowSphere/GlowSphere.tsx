import { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type GlowSphereProps = {
    positions: Float32Array;
    color?: THREE.ColorRepresentation;
    position?: [number, number, number];
    dotsFloatAmplitude?: number;
    dotsFloatSpeed?: number;
    rotationSpeed?: number;
};

export function GlowSphere({
    positions,
    color = "#66ccff",
    position = [0, 0, 0],
    dotsFloatAmplitude = 0.01,
    dotsFloatSpeed = 1,
    rotationSpeed = 0.2,
}: GlowSphereProps) {
    const rimMatRef = useRef<THREE.ShaderMaterial>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const baseColor = useMemo(() => new THREE.Color(color), [color]);
    const vertexShader = useMemo(
        () => `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDir = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
        [],
    );
    const fragmentShader = useMemo(
        () => `
        uniform vec3 uColor;
        uniform float uPower;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
            float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), uPower);
            vec3 glow = uColor * fresnel * uIntensity;
            gl_FragColor = vec4(glow, fresnel);
        }
        `,
        [],
    );
    const uniforms = useMemo(
        () => ({
            uColor: { value: baseColor.clone() },
            uPower: { value: 2.0 },
            uIntensity: { value: 1.5 },
        }),
        [baseColor],
    );

    useFrame((_, delta) => {
        if (groupRef.current)
            groupRef.current.rotation.y += rotationSpeed * delta;
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh>
                <sphereGeometry args={[0.75, 64, 64]} />
                <meshStandardMaterial
                    color={baseColor}
                    transparent
                    opacity={0.05}
                    metalness={0}
                    roughness={0.15}
                    depthWrite={false}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.76, 64, 64]} />
                <shaderMaterial
                    ref={rimMatRef}
                    args={[
                        {
                            uniforms,
                            vertexShader,
                            fragmentShader,
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false,
                        },
                    ]}
                />
            </mesh>
            <InstancedDots
                positions={positions}
                color={baseColor}
                floatAmplitude={dotsFloatAmplitude}
                floatSpeed={dotsFloatSpeed}
            />
        </group>
    );
}

type DotsProps = {
    positions: Float32Array;
    color: THREE.Color;
    floatAmplitude: number;
    floatSpeed: number;
};

function InstancedDots({
    positions,
    color,
    floatAmplitude,
    floatSpeed,
}: DotsProps) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const matrix = useMemo(() => new THREE.Matrix4(), []);
    const count = positions.length / 3;
    const dirs = useMemo(() => {
        const d = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = positions[i * 3 + 0];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            const v = new THREE.Vector3(x, y, z).normalize();
            d[i * 3 + 0] = v.x;
            d[i * 3 + 1] = v.y;
            d[i * 3 + 2] = v.z;
        }
        return d;
    }, [count, positions]);
    const radii = useMemo(() => {
        const r = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const x = positions[i * 3 + 0];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            r[i] = Math.sqrt(x * x + y * y + z * z);
        }
        return r;
    }, [count, positions]);
    const phases = useMemo(() => {
        const a = new Float32Array(count);
        for (let i = 0; i < count; i++) a[i] = i * 0.61803398875 * Math.PI * 2;
        return a;
    }, [count]);

    useLayoutEffect(() => {
        for (let i = 0; i < count; i++) {
            matrix.makeTranslation(
                positions[i * 3 + 0],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
            );
            ref.current.setMatrixAt(i, matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    }, [count, matrix, positions]);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            const r =
                radii[i] +
                Math.sin(t * floatSpeed + phases[i]) * floatAmplitude;
            const dx = dirs[i * 3 + 0];
            const dy = dirs[i * 3 + 1];
            const dz = dirs[i * 3 + 2];
            matrix.makeTranslation(dx * r, dy * r, dz * r);
            ref.current.setMatrixAt(i, matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={ref}
            args={[
                undefined as unknown as THREE.BufferGeometry,
                undefined as unknown as THREE.Material,
                count,
            ]}
            renderOrder={11}
        >
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.9}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}
