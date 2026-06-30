import { memo } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  SMAA,
  ChromaticAberration,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useMapStore } from "../../store/useMapStore";

const BloomEffect = memo(function BloomEffect() {
  return (
    <Bloom
      intensity={1.2}
      luminanceThreshold={0.4}
      luminanceSmoothing={0.9}
      mipmapBlur
      radius={0.8}
    />
  );
});

const NoBloomPipeline = memo(function NoBloomPipeline() {
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0005, 0.0005)}
      />
      <Vignette offset={0.3} darkness={0.7} />
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
});

const WithBloomPipeline = memo(function WithBloomPipeline() {
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <BloomEffect />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0005, 0.0005)}
      />
      <Vignette offset={0.3} darkness={0.7} />
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
});

export const PostProcessingPipeline = memo(function PostProcessingPipeline() {
  const bloomEnabled = useMapStore((s) => s.effectsEnabled.bloom);

  if (bloomEnabled) {
    return <WithBloomPipeline />;
  }
  return <NoBloomPipeline />;
});
