uniform vec3 uRimColor;
uniform float uRimPower;
uniform float uRimIntensity;

void main() {
  vec3 rimDir = normalize(vec3(0.0, -1.0, 0.0));
  float rim = pow(1.0 - max(dot(vNormal, rimDir), 0.0), uRimPower);
  csm_Emissive += uRimColor * rim * uRimIntensity;
}
