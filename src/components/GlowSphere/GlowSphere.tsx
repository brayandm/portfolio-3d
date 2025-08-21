import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CurvedEdges } from "../CurvedEdges/CurvedEdges";
import { InstancedDots } from "../InstancedDots/InstancedDots";

type GlowSphereProps = {
    positions: Float32Array;
    color?: THREE.ColorRepresentation;
    position?: [number, number, number];
    size?: number;
    dotsFloatAmplitude?: number;
    dotsFloatSpeed?: number;
    rotationSpeed?: number;
    edges?: Array<[number, number]>;
    edgeWidth?: number;
    edgeSegments?: number;
    orbitCenter?: [number, number, number];
    orbitSpeed?: number;
    orbitDirection?: 1 | -1;
    orbitAxis?: [number, number, number];
    atmosphere?: boolean;
    atmosphereColor?: THREE.ColorRepresentation;
    atmosphereIntensity?: number;
    atmospherePower?: number;
    atmosphereOpacity?: number;
    atmosphereOffset?: number;
};

export function GlowSphere({
    positions,
    color = "#66ccff",
    position = [0, 0, 0],
    size = 1,
    dotsFloatAmplitude = 0.05,
    dotsFloatSpeed = 0.6,
    rotationSpeed = 0.2,
    edges,
    edgeWidth = 0.004,
    edgeSegments = 32,
    orbitCenter,
    orbitSpeed = 0,
    orbitDirection = 1,
    orbitAxis = [0, 1, 0],
    atmosphere = false,
    atmosphereColor,
    atmosphereIntensity = 0.7,
    atmospherePower = 2.2,
    atmosphereOpacity = 0.35,
    atmosphereOffset = 0.05,
}: GlowSphereProps) {
    const rimMatRef = useRef<THREE.ShaderMaterial>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const baseColor = useMemo(() => new THREE.Color(color), [color]);
    const angleRef = useRef(0);
    const centerVec = useMemo(
        () =>
            orbitCenter
                ? new THREE.Vector3(
                      orbitCenter[0],
                      orbitCenter[1],
                      orbitCenter[2],
                  )
                : null,
        [orbitCenter],
    );
    const axisVec = useMemo(
        () =>
            new THREE.Vector3(
                orbitAxis[0],
                orbitAxis[1],
                orbitAxis[2],
            ).normalize(),
        [orbitAxis],
    );
    const initialOffset = useMemo(() => {
        if (!centerVec) return null;
        const p = new THREE.Vector3(position[0], position[1], position[2]);
        return p.sub(centerVec).clone();
    }, [centerVec, position]);
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
    const fragmentShaderAtmos = useMemo(
        () => `
        uniform vec3 uColor;
        uniform float uPower;
        uniform float uIntensity;
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
            float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), uPower);
            vec3 glow = uColor * fresnel * uIntensity;
            gl_FragColor = vec4(glow, clamp(fresnel * uOpacity, 0.0, 1.0));
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
    const atmosphereColorFinal = useMemo(
        () => new THREE.Color(atmosphereColor || color),
        [atmosphereColor, color],
    );
    const uniformsAtmos = useMemo(
        () => ({
            uColor: { value: atmosphereColorFinal.clone() },
            uPower: { value: atmospherePower },
            uIntensity: { value: atmosphereIntensity },
            uOpacity: { value: atmosphereOpacity },
        }),
        [atmosphereColorFinal, atmospherePower, atmosphereIntensity, atmosphereOpacity],
    );

    useFrame((_, delta) => {
        if (groupRef.current)
            groupRef.current.rotation.y += rotationSpeed * delta;
        if (
            groupRef.current &&
            centerVec &&
            initialOffset &&
            orbitSpeed !== 0
        ) {
            angleRef.current += orbitSpeed * orbitDirection * delta;
            const q = new THREE.Quaternion().setFromAxisAngle(
                axisVec,
                angleRef.current,
            );
            const rotated = initialOffset.clone().applyQuaternion(q);
            const nx = centerVec.x + rotated.x;
            const ny = centerVec.y + rotated.y;
            const nz = centerVec.z + rotated.z;
            groupRef.current.position.set(nx, ny, nz);
        }
    });

    return (
        <group ref={groupRef} position={position} scale={[size, size, size]}>
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
            {atmosphere && (
                <mesh>
                    <sphereGeometry args={[0.76 + atmosphereOffset, 64, 64]} />
                    <shaderMaterial
                        args={[
                            {
                                uniforms: uniformsAtmos,
                                vertexShader,
                                fragmentShader: fragmentShaderAtmos,
                                transparent: true,
                                blending: THREE.AdditiveBlending,
                                depthWrite: false,
                            },
                        ]}
                    />
                </mesh>
            )}
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
