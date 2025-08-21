import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type EdgesProps = {
    positions: Float32Array;
    color: THREE.Color;
    edges: Array<[number, number]>;
    width: number;
    segments: number;
};

export function CurvedEdges({
    positions,
    color,
    edges,
    width,
    segments,
}: EdgesProps) {
    const geoms = useMemo(() => {
        const toVec3 = (i: number) =>
            new THREE.Vector3(
                positions[i * 3 + 0],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
            );
        const arr: { geom: THREE.TubeGeometry; dir: 1 | -1 }[] = [];
        const tmp = new THREE.Vector3();
        for (const [a, b] of edges) {
            const v0 = toVec3(a);
            const v1 = toVec3(b);
            const r = (v0.length() + v1.length()) * 0.5;
            const pts: THREE.Vector3[] = [];
            for (let t = 0; t <= 1; t += 1 / segments) {
                tmp.copy(v0).lerp(v1, t).normalize().multiplyScalar(r);
                pts.push(tmp.clone());
            }
            const curve = new THREE.CatmullRomCurve3(pts);
            const geom = new THREE.TubeGeometry(
                curve,
                segments * 2,
                width,
                8,
                false,
            );
            const tubularSegments = segments * 2;
            const radialSegments = 8;
            const ringCount = tubularSegments + 1;
            const ringSize = radialSegments + 1;
            const tAttr = new Float32Array(ringCount * ringSize);
            for (let i = 0; i < ringCount; i++) {
                const t = i / tubularSegments;
                for (let j = 0; j < ringSize; j++) tAttr[i * ringSize + j] = t;
            }
            geom.setAttribute("aT", new THREE.BufferAttribute(tAttr, 1));
            const dir: 1 | -1 = 1;
            arr.push({ geom, dir });
        }
        return arr;
    }, [edges, positions, segments, width]);

    const mats = useRef<THREE.ShaderMaterial[]>([]);
    const vertex = useMemo(
        () => `
        attribute float aT;
        varying float vT;
        void main(){
            vT = aT;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
        [],
    );
    const fragment = useMemo(
        () => `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uBaseOpacity;
        uniform float uPulseWidth;
        uniform float uPulseIntensity;
        varying float vT;
        float pulse(float t, float center, float w){
            float d = abs(fract(t - center));
            d = min(d, 1.0 - d);
            float fall = smoothstep(w, 0.0, d);
            return fall;
        }
        void main(){
            float head = fract(uTime * uSpeed);
            float band = pulse(vT, head, uPulseWidth);
            float alpha = clamp(uBaseOpacity + band * uPulseIntensity, 0.0, 1.0);
            gl_FragColor = vec4(uColor, alpha);
        }
        `,
        [],
    );
    useFrame((_, delta) => {
        for (const m of mats.current) if (m) m.uniforms.uTime.value += delta;
    });

    return (
        <group renderOrder={10}>
            {geoms.map((g, i) => (
                <mesh key={i} geometry={g.geom}>
                    <shaderMaterial
                        ref={(el) => {
                            if (el) mats.current[i] = el;
                        }}
                        args={[{
                            vertexShader: vertex,
                            fragmentShader: fragment,
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false,
                            uniforms: {
                                uColor: { value: color },
                                uTime: { value: 0 },
                                uSpeed: { value: 0.5 },
                                uBaseOpacity: { value: 0.15 },
                                uPulseWidth: { value: 0.06 },
                                uPulseIntensity: { value: 0.85 },
                            },
                        }]} 
                    />
                </mesh>
            ))}
        </group>
    );
}
