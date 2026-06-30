import { useEffect, useRef, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import CameraControlsImpl from "camera-controls";
import * as THREE from "three";
import { useMapStore } from "../store/useMapStore";
import { CAMERA_OVERVIEW, CAMERA_FOCUS, CAMERA_LIMITS } from "../constants/mapConfig";

CameraControlsImpl.install({ THREE });

export function useCamera() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<CameraControlsImpl | null>(null);
  const cameraMode = useMapStore((s) => s.cameraMode);
  const focusTarget = useMapStore((s) => s.focusTarget);
  const setCameraMode = useMapStore((s) => s.setCameraMode);
  const setFocusTarget = useMapStore((s) => s.setFocusTarget);

  useEffect(() => {
    const controls = new CameraControlsImpl(camera, gl.domElement);
    controls.minDistance = CAMERA_LIMITS.minDistance;
    controls.maxDistance = CAMERA_LIMITS.maxDistance;
    controls.minPolarAngle = CAMERA_LIMITS.minPolarAngle;
    controls.maxPolarAngle = CAMERA_LIMITS.maxPolarAngle;
    controls.dollyToCursor = true;
    controls.smoothTime = 0.4;
    controls.draggingSmoothTime = 0.2;

    controls.setLookAt(
      CAMERA_OVERVIEW.position[0],
      CAMERA_OVERVIEW.position[1],
      CAMERA_OVERVIEW.position[2],
      CAMERA_OVERVIEW.target[0],
      CAMERA_OVERVIEW.target[1],
      CAMERA_OVERVIEW.target[2],
      false
    );

    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (cameraMode === "overview") {
      controls.setLookAt(
        CAMERA_OVERVIEW.position[0],
        CAMERA_OVERVIEW.position[1],
        CAMERA_OVERVIEW.position[2],
        CAMERA_OVERVIEW.target[0],
        CAMERA_OVERVIEW.target[1],
        CAMERA_OVERVIEW.target[2],
        true
      );
    } else if (cameraMode === "focus" && focusTarget) {
      const [nx, , nz] = focusTarget;
      controls.setLookAt(
        nx,
        CAMERA_FOCUS.yOffset,
        nz + CAMERA_FOCUS.zOffset,
        nx,
        0,
        nz,
        true
      );
    }
  }, [cameraMode, focusTarget]);

  useFrame((_, delta) => {
    controlsRef.current?.update(delta);
  });

  const focusOnPosition = useCallback(
    (position: [number, number, number]) => {
      setFocusTarget(position);
      setCameraMode("focus");
    },
    [setCameraMode, setFocusTarget]
  );

  const resetCamera = useCallback(() => {
    setCameraMode("overview");
    setFocusTarget(null);
  }, [setCameraMode, setFocusTarget]);

  return { controlsRef, focusOnPosition, resetCamera };
}
