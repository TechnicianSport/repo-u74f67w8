uniform vec3 uFresnelColor;
uniform float uFresnelPower;
uniform float uFresnelIntensity;

void main() {
  float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(csm_vViewDir)), uFresnelPower);
  csm_Emissive += uFresnelColor * fresnel * uFresnelIntensity;
}
