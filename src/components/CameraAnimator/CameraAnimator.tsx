import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type CameraAnimatorProps = {
	active: boolean;
	duration?: number;
	target?: [number, number, number];
	lookAt?: [number, number, number];
	ease?: (t: number) => number;
	stopDistance?: number;
};

export function CameraAnimator({
	active,
	duration = 2.5,
	target = [0, 0, 0],
	lookAt = [0, 0, 0],
	ease,
	stopDistance = 0,
}: CameraAnimatorProps) {
	const { camera } = useThree();
	const startPos = useRef(new THREE.Vector3());
	const targetVec = useMemo(() => new THREE.Vector3(...target), [target]);
	const lookTarget = useMemo(() => new THREE.Vector3(...lookAt), [lookAt]);
	const startTime = useRef<number | null>(null);
	const animating = useRef(false);
	const endPosRef = useRef(new THREE.Vector3());

	const easeFn = useMemo<NonNullable<CameraAnimatorProps["ease"]>>(
		() => ease || ((t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
		[ease],
	);

	useEffect(() => {
		if (active && !animating.current) {
			startPos.current.copy(camera.position);
			if (stopDistance > 0) {
				const dir = new THREE.Vector3().subVectors(startPos.current, lookTarget).normalize();
				endPosRef.current.copy(lookTarget).addScaledVector(dir, stopDistance);
			} else {
				endPosRef.current.copy(targetVec);
			}
			startTime.current = null;
			animating.current = true;
		}
		if (!active) {
			animating.current = false;
			startTime.current = null;
		}
	}, [active, camera, stopDistance, lookTarget, targetVec]);

	useFrame((state) => {
		if (!animating.current) return;
		const tNow = state.clock.elapsedTime;
		if (startTime.current == null) startTime.current = tNow;
		const t = Math.min(1, (tNow - startTime.current) / Math.max(0.0001, duration));
		const k = easeFn(t);
		camera.position.lerpVectors(startPos.current, endPosRef.current, k);
		camera.lookAt(lookTarget);
		if (t >= 1) {
			animating.current = false;
		}
	});

	return null;
}
