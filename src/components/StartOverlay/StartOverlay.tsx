import { Html } from "@react-three/drei";
import { useCallback, useEffect, useState } from "react";

type StartOverlayProps = {
    onStart: () => void;
    delayMs?: number;
    fadeMs?: number;
};

export function StartOverlay({
    onStart,
    delayMs = 3000,
    fadeMs = 2000,
}: StartOverlayProps) {
    const [fading, setFading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [appeared, setAppeared] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), Math.max(0, delayMs));
        return () => clearTimeout(t);
    }, [delayMs]);

    useEffect(() => {
        if (visible) {
            const id = requestAnimationFrame(() => setAppeared(true));
            return () => cancelAnimationFrame(id);
        } else {
            setAppeared(false);
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const onKey = () => {
            if (!fading) setFading(true);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [visible, fading]);

    const handleClick = useCallback(() => {
        if (!fading) setFading(true);
    }, [fading]);

    const handleTransitionEnd = useCallback(() => {
        if (fading) onStart();
    }, [fading, onStart]);

    if (!visible) return null;

    return (
        <Html prepend>
            <div
                onClick={handleClick}
                style={{
                    position: "fixed",
                    inset: 0,
                }}
            >
                <div
                    onTransitionEnd={handleTransitionEnd}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        letterSpacing: 6,
                        fontSize: 56,
                        color: "#00ffe1",
                        textShadow:
                            "0 0 6px #00fff2, 0 0 12px #00fff2, 0 0 24px #00fff2, 0 0 48px #00a1ff, 0 0 72px #0066ff",
                        userSelect: "none",
                        opacity: fading ? 0 : appeared ? 1 : 0,
                        transition: `opacity ${fadeMs}ms ease`,
                    }}
                >
                    START
                </div>
            </div>
        </Html>
    );
}
