uniform vec3 uScanlineColor;
uniform float uScanlineSpeed;
uniform float uScanlineFreq;
uniform float uScanlineAlpha;
uniform float uTime;

void main() {
  float line = sin((csm_vWorldPosition.y + uTime * uScanlineSpeed) * uScanlineFreq * 3.14159);
  line = smoothstep(0.8, 1.0, line);
  csm_Emissive += uScanlineColor * line * uScanlineAlpha;
}
