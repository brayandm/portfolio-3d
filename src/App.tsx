import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

function Cube() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((_, delta) => {
        meshRef.current.rotation.y += delta;
        meshRef.current.rotation.x += delta * 0.5;
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="tomato" />
        </mesh>
    );
}

function App() {
    return (
        <Canvas
            camera={{ position: [0, 0, 3] }}
            style={{ background: "black", width: "100vw", height: "100vh" }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[2, 2, 2]} />
            <Cube />
            <OrbitControls />
        </Canvas>
    );
}

export default App;
