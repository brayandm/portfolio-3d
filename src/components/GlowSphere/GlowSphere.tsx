import { useRef, useMemo } from "react";
import * as THREE from "three";

export function GlowSphere() {
    const rimMatRef = useRef<THREE.ShaderMaterial>(null!);
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
            uColor: { value: new THREE.Color("#66ccff") },
            uPower: { value: 2.0 },
            uIntensity: { value: 1.5 },
        }),
        [],
    );

    return (
        <group>
            <mesh>
                <sphereGeometry args={[0.75, 64, 64]} />
                <meshStandardMaterial
                    color={"white"}
                    transparent
                    opacity={0.05}
                    metalness={0}
                    roughness={0.15}
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
        </group>
    );
}
