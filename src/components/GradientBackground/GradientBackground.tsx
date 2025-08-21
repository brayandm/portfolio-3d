import { useMemo, useRef } from "react";
import { Color, BackSide, ShaderMaterial } from "three";

type GradientBackgroundProps = {
    innerRadius?: number;
    colorTop?: string;
    colorBottom?: string;
};

export function GradientBackground({
    innerRadius = 2000,
    colorTop = "#0b1020",
    colorBottom = "#000000",
}: GradientBackgroundProps) {
    const materialRef = useRef<ShaderMaterial>(null!);
    const vertexShader = useMemo(
        () => `
			varying vec3 vView;
			void main() {
				vec4 wp = modelMatrix * vec4(position, 1.0);
				vec4 vp = viewMatrix * wp;
				vView = vp.xyz;
				gl_Position = projectionMatrix * vp;
			}
		`,
        [],
    );
    const fragmentShader = useMemo(
        () => `
			uniform vec3 uTop;
			uniform vec3 uBottom;
			uniform float uRadius;
			varying vec3 vView;
			void main() {
				float d = clamp((-vView.z) / uRadius, 0.0, 1.0);
				vec3 col = mix(uBottom, uTop, d);
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
                args={[
                    {
                        vertexShader,
                        fragmentShader,
                        side: BackSide,
                        depthWrite: false,
                        uniforms: {
                            uTop: { value: new Color(colorTop) },
                            uBottom: { value: new Color(colorBottom) },
                            uRadius: { value: innerRadius },
                        },
                    },
                ]}
            />
        </mesh>
    );
}
