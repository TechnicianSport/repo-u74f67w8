uniform float uTime;
uniform float uWaveHeight;
uniform float uWaveFreq;
uniform float uWaveSpeed;

void main() {
  float w1 = sin(position.x * uWaveFreq + uTime * uWaveSpeed) * uWaveHeight;
  float w2 = sin(position.z * uWaveFreq * 0.7 + uTime * uWaveSpeed * 1.3) * uWaveHeight * 0.6;
  csm_Position.y += w1 + w2;
}
