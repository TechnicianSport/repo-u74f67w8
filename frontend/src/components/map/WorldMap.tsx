import { memo, Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CameraControlsImpl from "camera-controls";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { EarthGlobe } from "./EarthGlobe";
import { CloudsLayer } from "./CloudsLayer";
import { CountryBorders } from "./CountryBorders";
import { CountryLabels } from "./CountryLabels";
import { GlobeStorylineCluster } from "./GlobeStorylineCluster";
import { GlobeAtmosphere } from "./GlobeAtmosphere";
import { AmbientParticles } from "../effects/AmbientParticles";
import { PostProcessingPipeline } from "../effects/PostProcessingPipeline";
import { getSunDirection } from "../../utils/sunPosition";
import { GLOBE_RADIUS } from "../../utils/sphereProjection";

CameraControlsImpl.install({ THREE });

const GlobeCameraController = memo(function GlobeCameraController() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<CameraControlsImpl | null>(null);
  const cameraMode = useMapStore((s) => s.cameraMode);
  const focusTarget = useMapStore((s) => s.focusTarget);

  useEffect(() => {
    const controls = new CameraControlsImpl(camera, gl.domElement);
    controls.minDistance = GLOBE_RADIUS + 2;
    controls.maxDistance = GLOBE_RADIUS * 6;
    controls.dollyToCursor = false;
    controls.smoothTime = 0.5;
    controls.draggingSmoothTime = 0.25;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

    controls.setLookAt(0, 0, GLOBE_RADIUS * 3.5, 0, 0, 0, false);
    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (cameraMode === "overview") {
      controls.setLookAt(0, 0, GLOBE_RADIUS * 3.5, 0, 0, 0, true);
    } else if (cameraMode === "focus" && focusTarget) {
      const [fx, fy, fz] = focusTarget;
      const dir = new THREE.Vector3(fx, fy, fz).normalize();
      const camPos = dir.clone().multiplyScalar(GLOBE_RADIUS * 2);
      controls.setLookAt(camPos.x, camPos.y, camPos.z, 0, 0, 0, true);
    }
  }, [cameraMode, focusTarget]);

  useFrame((_, delta) => {
    controlsRef.current?.update(delta);
  });

  return null;
});

const SunLight = memo(function SunLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      const sun = getSunDirection();
      lightRef.current.position.copy(sun.multiplyScalar(50));
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={1.5}
      position={[50, 30, 30]}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
  );
});

const SceneContent = memo(function SceneContent() {
  const storylines = useNewsStore((s) => s.storylines);
  const showClouds = useSettingsStore((s) => s.showClouds);
  const showBorders = useSettingsStore((s) => s.showBorders);
  const showCountryLabels = useSettingsStore((s) => s.showCountryLabels);
  const showAtmosphere = useSettingsStore((s) => s.showAtmosphere);

  return (
    <>
      <GlobeCameraController />

      <ambientLight intensity={0.08} color="#1A1A2E" />
      <SunLight />
      <pointLight intensity={0.15} color="#0033FF" position={[0, -10, 0]} />

      <EarthGlobe />

      {showClouds && (
        <Suspense fallback={null}>
          <CloudsLayer />
        </Suspense>
      )}

      {showBorders && <CountryBorders />}

      {showCountryLabels && (
        <Suspense fallback={null}>
          <CountryLabels />
        </Suspense>
      )}

      <GlobeStorylineCluster storylines={storylines} />

      {showAtmosphere && <GlobeAtmosphere />}

      <AmbientParticles />

      <PostProcessingPipeline />
    </>
  );
});

export const WorldMap = memo(function WorldMap() {
  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      state.gl.setClearColor("#020408");
    },
    []
  );

  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 0, GLOBE_RADIUS * 3.5],
        near: 0.1,
        far: 200,
      }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: false,
        toneMapping: THREE.NoToneMapping,
      }}
      dpr={[1, 2]}
      onCreated={handleCreated}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#020408",
      }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
});
