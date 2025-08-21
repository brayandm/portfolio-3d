import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GlowSphere } from "./components/GlowSphere/GlowSphere";

function App() {
    const positions = useMemo(() => {
        const count = 20;
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const z = Math.random() * 2 - 1;
            const v = new THREE.Vector3(x, y, z)
                .normalize()
                .multiplyScalar(0.77);
            arr[i * 3 + 0] = v.x;
            arr[i * 3 + 1] = v.y;
            arr[i * 3 + 2] = v.z;
        }
        return arr;
    }, []);
    return (
        <Canvas
            camera={{ position: [0, 0, 3] }}
            style={{ background: "black", width: "100vw", height: "100vh" }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[2, 2, 2]} />
            <GlowSphere
                positions={positions}
                color={"#66ccff"}
                position={[0, 0, 0]}
            />
            <OrbitControls />
        </Canvas>
    );
}

export default App;
