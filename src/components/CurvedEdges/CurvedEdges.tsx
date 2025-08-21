import { useMemo } from "react";
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
        const arr: THREE.TubeGeometry[] = [];
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
            arr.push(geom);
        }
        return arr;
    }, [edges, positions, segments, width]);

    return (
        <group renderOrder={10}>
            {geoms.map((g, i) => (
                <mesh key={i} geometry={g}>
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.35}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}
