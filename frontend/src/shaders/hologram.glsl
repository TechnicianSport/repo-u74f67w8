uniform vec3 uHologramColor;
uniform float uTime;
uniform float uFlickerSpeed;

void main() {
  float scan = sin(csm_vWorldPosition.y * 80.0 + uTime) * 0.5 + 0.5;
  scan = pow(scan, 4.0) * 0.3;
  float noise = fract(sin(dot(vec2(uTime * 0.1), vec2(12.9898, 78.233))) * 43758.5453);
  float flicker = 0.9 + 0.1 * noise;
  float rim = pow(1.0 - abs(dot(vNormal, csm_vViewDir)), 2.0);
  csm_Emissive += uHologramColor * (scan + rim * 0.8) * flicker;
  csm_Opacity *= (0.7 + rim * 0.3) * flicker;
}
