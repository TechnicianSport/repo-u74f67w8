import { memo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useCountryGeometry } from "../../hooks/useCountryGeometry";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { CountryFloor } from "./CountryFloor";
import { OceanPlane } from "./OceanPlane";
import { GridOverlay } from "./GridOverlay";
import { FlatEarthTexture } from "./FlatEarthTexture";
import { FlatCountryBorders } from "./FlatCountryBorders";
import { FlatCountryLabels } from "./FlatCountryLabels";
import { AtmosphereLayer } from "./AtmosphereLayer";
import { StorylineCluster } from "./StorylineCluster";
import { ConnectionsManager } from "./ConnectionsManager";
import { CameraController } from "./CameraController";
import { PulseRing } from "../effects/PulseRing";
import { AmbientParticles } from "../effects/AmbientParticles";
import { PostProcessingPipeline } from "../effects/PostProcessingPipeline";
import { LIGHTING } from "../../constants/mapConfig";

const SceneContent = memo(function SceneContent() {
  const { projection } = useCountryGeometry();
  const storylines = useNewsStore((s) => s.storylines);
  const effectsEnabled = useMapStore((s) => s.effectsEnabled);
  const showBorders = useSettingsStore((s) => s.showBorders);
  const showCountryLabels = useSettingsStore((s) => s.showCountryLabels);
  const showAtmosphere = useSettingsStore((s) => s.showAtmosphere);

  return (
    <>
      <CameraController />

      <ambientLight
        intensity={LIGHTING.ambient.intensity}
        color={LIGHTING.ambient.color}
      />
      <directionalLight
        intensity={LIGHTING.directional.intensity}
        position={LIGHTING.directional.position as unknown as THREE.Vector3}
        castShadow
        shadow-mapSize-width={LIGHTING.directional.shadowMapSize}
        shadow-mapSize-height={LIGHTING.directional.shadowMapSize}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <pointLight
        intensity={LIGHTING.point.intensity}
        color={LIGHTING.point.color}
        position={LIGHTING.point.position as unknown as THREE.Vector3}
      />

      <CountryFloor />

      {effectsEnabled.ocean && <OceanPlane />}

      <Suspense fallback={null}>
        <FlatEarthTexture />
      </Suspense>

      {showBorders && <FlatCountryBorders />}

      {showCountryLabels && (
        <Suspense fallback={null}>
          <FlatCountryLabels />
        </Suspense>
      )}

      {effectsEnabled.grid && <GridOverlay />}

      <StorylineCluster storylines={storylines} projection={projection} />

      {effectsEnabled.connections && (
        <ConnectionsManager storylines={storylines} projection={projection} />
      )}

      <PulseRing />

      <AmbientParticles />

      {showAtmosphere && effectsEnabled.atmosphere && <AtmosphereLayer />}

      <PostProcessingPipeline />
    </>
  );
});

export const WorldMap = memo(function WorldMap() {
  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 18, 24],
        near: 0.1,
        far: 200,
      }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: false,
        toneMapping: THREE.NoToneMapping,
      }}
      dpr={[1, 2]}
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
