import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CurvedEdges } from "../CurvedEdges/CurvedEdges";
import { InstancedDots } from "../InstancedDots/InstancedDots";

type GlowSphereProps = {
    positions: Float32Array;
    color?: THREE.ColorRepresentation;
    position?: [number, number, number];
    dotsFloatAmplitude?: number;
    dotsFloatSpeed?: number;
    rotationSpeed?: number;
    edges?: Array<[number, number]>;
    edgeWidth?: number;
    edgeSegments?: number;
};

export function GlowSphere({
    positions,
    color = "#66ccff",
    position = [0, 0, 0],
    dotsFloatAmplitude = 0.05,
    dotsFloatSpeed = 0.6,
    rotationSpeed = 0.2,
    edges,
    edgeWidth = 0.006,
    edgeSegments = 32,
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
            {edges && edges.length > 0 && (
                <CurvedEdges
                    positions={positions}
                    color={baseColor}
                    edges={edges}
                    width={edgeWidth}
                    segments={edgeSegments}
                />
            )}
        </group>
    );
}
