import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

type DotsProps = {
    positions: Float32Array;
    color: THREE.Color;
    floatAmplitude: number;
    floatSpeed: number;
};

export function InstancedDots({
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
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </instancedMesh>
    );
}
