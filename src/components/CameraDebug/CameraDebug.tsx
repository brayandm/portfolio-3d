import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type CameraDebugProps = {
	decimals?: number;
};

export function CameraDebug({ decimals = 2 }: CameraDebugProps) {
	const { camera } = useThree();
	const elRef = useRef<HTMLDivElement>(null);
	const tmp = useRef(new THREE.Vector3());

	useFrame(() => {
		const p = camera.position;
		const d = camera.getWorldDirection(tmp.current);
		const f = (n: number) => n.toFixed(decimals);
		if (elRef.current) {
			elRef.current.textContent = `pos: (${f(p.x)}, ${f(p.y)}, ${f(p.z)})  dir: (${f(d.x)}, ${f(d.y)}, ${f(d.z)})`;
		}
	});

	return (
		<Html prepend>
			<div
				ref={elRef}
				style={{
					position: "fixed",
					top: 8,
					left: 8,
					fontFamily: "monospace",
					fontSize: 12,
					color: "#9ee7ff",
					background: "rgba(0,0,0,0.4)",
					padding: "6px 8px",
					borderRadius: 6,
					pointerEvents: "none",
				}}
			/>
		</Html>
	);
}
