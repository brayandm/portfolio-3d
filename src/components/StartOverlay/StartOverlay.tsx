import { Html } from "@react-three/drei";
import { useCallback, useState } from "react";

type StartOverlayProps = {
    onStart: () => void;
};

export function StartOverlay({ onStart }: StartOverlayProps) {
	const [fading, setFading] = useState(false);

	const handleClick = useCallback(() => {
		if (!fading) setFading(true);
	}, [fading]);

	const handleTransitionEnd = useCallback(() => {
		if (fading) onStart();
	}, [fading, onStart]);

    return (
        <Html prepend>
            <div
                onClick={handleClick}
                onTransitionEnd={handleTransitionEnd}
                style={{
                    position: "fixed",
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
                    cursor: "pointer",
                    userSelect: "none",
                    opacity: fading ? 0 : 1,
                    transition: "opacity 600ms ease",
                }}
            >
                START
            </div>
        </Html>
    );
}
