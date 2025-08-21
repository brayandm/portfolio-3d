import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundStarsProps = {
	count?: number;
	radius?: number;
	depth?: number;
	color?: THREE.ColorRepresentation;
	size?: number;
	rotationSpeed?: number;
};

export function BackgroundStars({
	count = 1000,
	radius = 60,
	depth = 40,
	color = "#88aaff",
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

	const groupRef = useRef<THREE.Group>(null!);
	useFrame((_, delta) => {
		if (groupRef.current) groupRef.current.rotation.y += rotationSpeed * delta;
	});

	return (
		<group ref={groupRef} renderOrder={-1}>
			<points>
				<bufferGeometry>
					<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				</bufferGeometry>
				<pointsMaterial
					color={color}
					size={size}
					sizeAttenuation={false}
					transparent
					opacity={0.9}
					depthWrite={false}
					depthTest={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>
		</group>
	);
}
