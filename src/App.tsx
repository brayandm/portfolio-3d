import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GlowSphere } from "./components/GlowSphere/GlowSphere";

function App() {
    return (
        <Canvas
            camera={{ position: [0, 0, 3] }}
            style={{ background: "black", width: "100vw", height: "100vh" }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[2, 2, 2]} />
            <GlowSphere />
            <OrbitControls />
        </Canvas>
    );
}

export default App;
