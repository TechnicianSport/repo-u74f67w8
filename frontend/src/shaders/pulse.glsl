uniform float uPulseTime;
uniform vec3 uPulseColor;
uniform float uPulseSpeed;
uniform float uPulseWidth;
uniform vec2 uNodeCenter;

void main() {
  vec2 pos2D = vec2(csm_vWorldPosition.x, csm_vWorldPosition.z);
  float dist = length(pos2D - uNodeCenter);
  float wave = uPulseTime * uPulseSpeed;
  float ring = smoothstep(wave - uPulseWidth, wave, dist)
             - smoothstep(wave, wave + uPulseWidth, dist);
  float fade = 1.0 - smoothstep(0.0, 3.0, uPulseTime);
  csm_Emissive += uPulseColor * ring * fade * 2.0;
}
