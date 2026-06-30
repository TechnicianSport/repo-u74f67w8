import { memo, useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useSettingsStore } from "../../store/useSettingsStore";
import { getSunDirection } from "../../utils/sunPosition";
import { GLOBE_RADIUS } from "../../utils/sphereProjection";

const DAY_NIGHT_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DAY_NIGHT_FRAGMENT = `
  #extension GL_OES_standard_derivatives : enable
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D bumpMap;
  uniform sampler2D specMap;
  uniform vec3 sunDirection;
  uniform float useDayNight;
  uniform float useBump;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);

    // bump mapping
    if (useBump > 0.5) {
      float bumpScale = 0.03;
      vec2 dSTdx = dFdx(vUv);
      vec2 dSTdy = dFdy(vUv);
      float Hll = texture2D(bumpMap, vUv).r;
      float dBx = texture2D(bumpMap, vUv + dSTdx).r - Hll;
      float dBy = texture2D(bumpMap, vUv + dSTdy).r - Hll;
      vec3 perturbedNormal = normalize(normal + bumpScale * (dBx * normalize(dFdx(vWorldPosition)) + dBy * normalize(dFdy(vWorldPosition))));
      normal = perturbedNormal;
    }

    vec3 sunDir = normalize(sunDirection);
    float NdotL = dot(normal, sunDir);

    vec4 dayColor = texture2D(dayMap, vUv);
    vec4 nightColor = texture2D(nightMap, vUv);

    // night map: boost city lights
    nightColor.rgb *= 1.8;

    float dayFactor;
    if (useDayNight > 0.5) {
      // smooth terminator gradient
      dayFactor = smoothstep(-0.15, 0.25, NdotL);
    } else {
      dayFactor = 1.0;
    }

    vec4 finalColor = mix(nightColor, dayColor, dayFactor);

    // diffuse lighting on day side
    float diffuse = max(NdotL, 0.0) * 0.3;
    finalColor.rgb += dayColor.rgb * diffuse * dayFactor;

    // ambient
    finalColor.rgb += dayColor.rgb * 0.05;

    // specular for water
    float waterMask = texture2D(specMap, vUv).r;
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(sunDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 64.0) * waterMask * dayFactor;
    finalColor.rgb += vec3(0.4, 0.6, 0.9) * specular * 0.4;

    // atmospheric rim
    float rim = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
    rim = pow(rim, 3.5);
    vec3 rimColor = mix(vec3(0.02, 0.05, 0.15), vec3(0.3, 0.5, 1.0), dayFactor);
    finalColor.rgb += rimColor * rim * 0.5;

    gl_FragColor = vec4(finalColor.rgb, 1.0);
  }
`;

export const EarthGlobe = memo(function EarthGlobe() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const showDayNight = useSettingsStore((s) => s.showDayNight);
  const showBumpMap = useSettingsStore((s) => s.showBumpMap);

  const dayTex = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");
  const nightTex = useLoader(THREE.TextureLoader, "/textures/earth-night.jpg");
  const bumpTex = useLoader(THREE.TextureLoader, "/textures/earth-topology.png");
  const specTex = useLoader(THREE.TextureLoader, "/textures/earth-water.png");

  useMemo(() => {
    for (const tex of [dayTex, nightTex, bumpTex, specTex]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
    }
  }, [dayTex, nightTex, bumpTex, specTex]);

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayTex },
      nightMap: { value: nightTex },
      bumpMap: { value: bumpTex },
      specMap: { value: specTex },
      sunDirection: { value: getSunDirection() },
      useDayNight: { value: showDayNight ? 1.0 : 0.0 },
      useBump: { value: showBumpMap ? 1.0 : 0.0 },
    }),
    [dayTex, nightTex, bumpTex, specTex, showDayNight, showBumpMap]
  );

  useFrame(() => {
    if (!materialRef.current) return;
    const sun = getSunDirection();
    materialRef.current.uniforms.sunDirection.value.copy(sun);
    materialRef.current.uniforms.useDayNight.value = showDayNight ? 1.0 : 0.0;
    materialRef.current.uniforms.useBump.value = showBumpMap ? 1.0 : 0.0;
  });

  return (
    <mesh rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[GLOBE_RADIUS, 128, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={DAY_NIGHT_VERTEX}
        fragmentShader={DAY_NIGHT_FRAGMENT}
      />
    </mesh>
  );
});
