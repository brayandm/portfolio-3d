import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GlowSphere } from "./components/GlowSphere/GlowSphere";
import { BackgroundStars } from "./components/BackgroundStars/BackgroundStars";
import { Random } from "./utils/random";
import { GradientBackground } from "./components/GradientBackground/GradientBackground";
import { NebulaLayer } from "./components/NebulaLayer/NebulaLayer";
import { StartOverlay } from "./components/StartOverlay/StartOverlay";
import { CameraAnimator } from "./components/CameraAnimator/CameraAnimator";

function App() {
    const [started, setStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const startMusic = () => {
        const el = audioRef.current;
        if (el) {
            el.loop = true;
            el.currentTime = 0;
            el.play().catch(() => {});
        }
    };
    const handleStart = () => {
        setStarted(true);
    };
    const DOTS_COUNT = 20;
    const EDGE_COUNT = 10;
    const DOTS_FLOAT_AMPLITUDE = 0.01;
    const DOTS_FLOAT_SPEED = 1;
    const ROTATION_SPEED = 0.2;

    const rng = useMemo(() => new Random(0), []);

    const positions = useMemo(() => {
        const count = DOTS_COUNT;
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = rng.random() * 2 - 1;
            const y = rng.random() * 2 - 1;
            const z = rng.random() * 2 - 1;
            const v = new THREE.Vector3(x, y, z)
                .normalize()
                .multiplyScalar(0.77);
            arr[i * 3 + 0] = v.x;
            arr[i * 3 + 1] = v.y;
            arr[i * 3 + 2] = v.z;
        }
        return arr;
    }, [rng]);
    const edges = useMemo(() => {
        const n = positions.length / 3;
        const s = new Set<string>();
        const r: Array<[number, number]> = [];
        while (r.length < Math.min(EDGE_COUNT, (n * (n - 1)) / 2)) {
            const a = Math.floor(rng.random() * n);
            const b = Math.floor(rng.random() * n);
            if (a === b) continue;
            const k = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (s.has(k)) continue;
            s.add(k);
            r.push([a, b]);
        }
        return r;
    }, [positions, rng]);
    return (
        <>
            <audio ref={audioRef} src="/audio.mp3" preload="auto" loop />
            <Canvas
                camera={{ position: [50, -400, 280], far: 100000000 }}
                style={{ background: "black", width: "100vw", height: "100vh" }}
            >
                {!started && (
                    <StartOverlay
                        onStart={handleStart}
                        startMusic={startMusic}
                    />
                )}
                <CameraAnimator
                    active={started}
                    duration={3}
                    target={[0, 0, 0]}
                    lookAt={[0, 0, 0]}
                    stopDistance={3}
                />
                <GradientBackground
                    innerRadius={10000}
                    colorTop="#1a1446"
                    colorBottom="#020611"
                />
                <NebulaLayer
                    count={10}
                    radius={45}
                    opacity={0.03}
                    scaleRange={[20, 100]}
                />
                <BackgroundStars
                    countInner={400}
                    countOuter={750}
                    radius={98}
                    depth={10}
                    size={2}
                    innerHoleRadius={30}
                    shellThickness={20}
                />
                <ambientLight intensity={0.5} />
                <pointLight position={[2, 2, 2]} />
                <GlowSphere
                    positions={positions}
                    color={"#ffd200"}
                    position={[0, 0, 0]}
                    dotsFloatAmplitude={DOTS_FLOAT_AMPLITUDE}
                    dotsFloatSpeed={DOTS_FLOAT_SPEED}
                    rotationSpeed={ROTATION_SPEED * 0.1}
                    edges={edges}
                    size={3}
                />
                <GlowSphere
                    positions={positions}
                    color={"#66ccff"}
                    position={[5, 0, 0]}
                    dotsFloatAmplitude={DOTS_FLOAT_AMPLITUDE}
                    dotsFloatSpeed={DOTS_FLOAT_SPEED}
                    rotationSpeed={ROTATION_SPEED}
                    edges={edges}
                    orbitCenter={[0, 0, 0]}
                    orbitSpeed={0.1}
                    orbitDirection={1}
                />
                <GlowSphere
                    positions={positions}
                    color={"red"}
                    position={[10, 0, 0]}
                    dotsFloatAmplitude={DOTS_FLOAT_AMPLITUDE}
                    dotsFloatSpeed={DOTS_FLOAT_SPEED}
                    rotationSpeed={ROTATION_SPEED}
                    edges={edges}
                    orbitCenter={[0, 0, 0]}
                    orbitSpeed={0.05}
                    orbitDirection={1}
                    size={1.2}
                    ring={true}
                    ringColor="red"
                />
                <GlowSphere
                    positions={positions}
                    color={"yellow"}
                    position={[-4, 0, 10]}
                    dotsFloatAmplitude={DOTS_FLOAT_AMPLITUDE}
                    dotsFloatSpeed={DOTS_FLOAT_SPEED}
                    rotationSpeed={ROTATION_SPEED}
                    edges={edges}
                    orbitCenter={[0, 0, 0]}
                    orbitSpeed={0.07}
                    orbitDirection={1}
                    size={1.5}
                    atmosphere
                    atmosphereColor="yellow"
                />
                <OrbitControls />
            </Canvas>
        </>
    );
}

export default App;
