uniform vec3 uBorderColor;
uniform float uBorderWidth;
uniform float uBorderIntensity;
uniform float uTime;

void main() {
  vec2 edge = abs(vUv - 0.5) * 2.0;
  float border = smoothstep(1.0 - uBorderWidth, 1.0, max(edge.x, edge.y));
  float flicker = 0.85 + 0.15 * sin(uTime * 3.0 + vUv.x * 10.0);
  csm_Emissive += uBorderColor * border * uBorderIntensity * flicker;
}
