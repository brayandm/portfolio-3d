import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";

type GlowSphereProps = {
    positions: Float32Array;
    color?: THREE.ColorRepresentation;
    position?: [number, number, number];
};

export function GlowSphere({
    positions,
    color = "#66ccff",
    position = [0, 0, 0],
}: GlowSphereProps) {
    const rimMatRef = useRef<THREE.ShaderMaterial>(null!);
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

    return (
        <group position={position}>
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
            <InstancedDots positions={positions} color={baseColor} />
        </group>
    );
}

type DotsProps = { positions: Float32Array; color: THREE.Color };

function InstancedDots({ positions, color }: DotsProps) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const matrix = useMemo(() => new THREE.Matrix4(), []);
    const count = positions.length / 3;

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
