import { Billboard } from "@react-three/drei";
import { useMemo } from "react";
import { Color, Vector3 } from "three";
import { random } from "../../utils/random";

type NebulaLayerProps = {
	count?: number;
	radius?: number;
	scaleRange?: [number, number];
	colors?: string[];
	opacity?: number;
};

export function NebulaLayer({
	count = 4,
	radius = 35,
	scaleRange = [12, 18],
	colors = ["#6a4cff", "#24c1e0", "#ff4cc9"],
	opacity = 0.35,
}: NebulaLayerProps) {
	const instances = useMemo(() => {
		const out: { position: Vector3; scale: number; color: Color }[] = [];
		for (let i = 0; i < count; i++) {
			const theta = random() * Math.PI * 2;
			const phi = Math.acos(2 * random() - 1);
			const r = radius * (0.6 + random() * 0.4);
			const pos = new Vector3(
				r * Math.sin(phi) * Math.cos(theta),
				r * Math.sin(phi) * Math.sin(theta),
				r * Math.cos(phi),
			);
			const scale = scaleRange[0] + random() * (scaleRange[1] - scaleRange[0]);
			const color = new Color(colors[Math.floor(random() * colors.length)]);
			out.push({ position: pos, scale, color });
		}
		return out;
	}, [count, radius, scaleRange, colors]);

	const vertex = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;
	const fragment = `
		uniform vec3 uColor;
		uniform float uOpacity;
		varying vec2 vUv;
		float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
		float noise(vec2 p){
			vec2 i = floor(p);
			vec2 f = fract(p);
			float a = rand(i);
			float b = rand(i + vec2(1.0, 0.0));
			float c = rand(i + vec2(0.0, 1.0));
			float d = rand(i + vec2(1.0, 1.0));
			vec2 u = f * f * (3.0 - 2.0 * f);
			return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
		}
		void main() {
			vec2 p = vUv - 0.5;
			float d = length(p);
			float base = smoothstep(0.5, 0.0, d);
			float n = noise(vUv * 4.0) * 0.5 + noise(vUv * 8.0) * 0.35;
			float mask = clamp(base * (0.8 + 0.4 * n), 0.0, 1.0);
			gl_FragColor = vec4(uColor, mask * uOpacity);
		}
	`;

	return (
		<group renderOrder={-5} frustumCulled={false}>
			{instances.map((it, i) => (
				<Billboard key={i} position={it.position.toArray()}>
					<mesh scale={[it.scale, it.scale, 1]}>
						<planeGeometry args={[1, 1, 1, 1]} />
						<shaderMaterial
							args={[{
								vertexShader: vertex,
								fragmentShader: fragment,
								transparent: true,
								depthWrite: false,
								depthTest: false,
								blending: 2,
								uniforms: {
									uColor: { value: it.color },
									uOpacity: { value: opacity },
								},
							}]}
						/>
					</mesh>
				</Billboard>
			))}
		</group>
	);
}
