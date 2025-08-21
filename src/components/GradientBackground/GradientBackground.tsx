import { useMemo, useRef } from "react";
import { Color, BackSide, ShaderMaterial } from "three";

type GradientBackgroundProps = {
	innerRadius?: number;
	colorTop?: string;
	colorBottom?: string;
};

export function GradientBackground({
	innerRadius = 200,
	colorTop = "#0b1020",
	colorBottom = "#000000",
}: GradientBackgroundProps) {
	const materialRef = useRef<ShaderMaterial>(null!);
	const vertexShader = useMemo(
		() => `
			varying vec3 vWorld;
			void main() {
				vec4 wp = modelMatrix * vec4(position, 1.0);
				vWorld = wp.xyz;
				gl_Position = projectionMatrix * viewMatrix * wp;
			}
		`,
		[],
	);
	const fragmentShader = useMemo(
		() => `
			uniform vec3 uTop;
			uniform vec3 uBottom;
			varying vec3 vWorld;
			void main() {
				float h = normalize(vWorld).y * 0.5 + 0.5;
				vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, h));
				gl_FragColor = vec4(col, 1.0);
			}
		`,
		[],
	);
	return (
		<mesh renderOrder={-10} frustumCulled={false}>
			<sphereGeometry args={[innerRadius, 32, 32]} />
			<shaderMaterial
				ref={materialRef}
				args={[{
					vertexShader,
					fragmentShader,
					side: BackSide,
					depthWrite: false,
					uniforms: {
						uTop: { value: new Color(colorTop) },
						uBottom: { value: new Color(colorBottom) },
					},
				}]}
			/>
		</mesh>
	);
}
