precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                          dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Lightweight fog - smooth layered fbm
float volumetricFog(vec2 uv, float t) {
  // Two smooth fbm layers at different scales
  vec2 p1 = uv * 0.6 + vec2(t * 0.05, t * 0.03);
  vec2 p2 = uv * 1.0 + vec2(-t * 0.04, t * 0.025) + 10.0;
  
  float fog = fbm(p1) * 0.55 + fbm(p2) * 0.35;
  fog = smoothstep(0.05, 0.6, fog);
  
  return fog * 0.7;
}

// Light scattering approximation
vec3 lightScatter(vec2 uv, float t) {
  // Simulated light source positions
  vec2 light1 = vec2(0.3, 0.6) + vec2(sin(t * 0.2), cos(t * 0.15)) * 0.2;
  vec2 light2 = vec2(-0.4, -0.3) + vec2(cos(t * 0.18), sin(t * 0.22)) * 0.15;
  
  // Distance-based scattering
  float scatter1 = exp(-length(uv - light1) * 2.0);
  float scatter2 = exp(-length(uv - light2) * 2.5);
  
  // Colored light sources
  vec3 lightCol1 = vec3(0.3, 0.5, 0.8) * scatter1;
  vec3 lightCol2 = vec3(0.5, 0.3, 0.6) * scatter2;
  
  return (lightCol1 + lightCol2) * 0.4;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.08;
  
  // Warped coordinates for organic flow
  vec2 wp = p * 0.6 + vec2(snoise(p * 0.5 + t * 0.1), snoise(p * 0.5 + vec2(5.2, 1.3) - t * 0.08)) * 0.2;
  
  // Main noise layer
  float baseNoise = fbm(wp + t * 0.04);
  float n1 = baseNoise;
  float n2 = fbm(p * 0.8 - t * 0.03 + 10.0);
  
  // Base color - deep space
  vec3 col = vec3(0.01, 0.01, 0.02);
  
  // Nebula-like color bands
  vec3 color1 = vec3(0.05, 0.02, 0.08); // Deep purple
  vec3 color2 = vec3(0.02, 0.04, 0.10); // Deep blue
  vec3 color3 = vec3(0.04, 0.06, 0.08); // Teal hint
  
  // Layer the colors with noise (reuse n1 and n2)
  float blend1 = smoothstep(-0.2, 0.5, n1);
  float blend2 = smoothstep(-0.3, 0.4, n2);
  float blend3 = smoothstep(0.0, 0.6, n1 * 0.7 + n2 * 0.3); // Derive from existing noise
  
  col = mix(col, color1, blend1 * 0.6);
  col = mix(col, color2, blend2 * 0.5);
  col = mix(col, color3, blend3 * 0.3);
  
  // === VOLUMETRIC FOG ===
  float fog = volumetricFog(p, u_time);
  
  // Nebula colors - blue, purple, and aurora green
  float colorMix = baseNoise * 0.5 + 0.5;
  float greenMix = smoothstep(0.55, 0.75, colorMix) * smoothstep(0.95, 0.7, colorMix); // Narrow band
  vec3 fogBlue = vec3(0.12, 0.16, 0.35);
  vec3 fogPurple = vec3(0.25, 0.10, 0.35);
  vec3 fogGreen = vec3(0.08, 0.35, 0.18); // Aurora green
  vec3 fogColor = mix(fogBlue, fogPurple, smoothstep(0.3, 0.7, colorMix));
  fogColor = mix(fogColor, fogGreen, greenMix * 0.4); // Subtle green accent

  // Reduce fog on smaller screens (mobile)
  float fogStrength = u_resolution.x < 600.0 ? 0.3 : 0.55;
  col = mix(col, fogColor, fog * fogStrength);
  
  // Light scattering through fog
  vec3 scatter = lightScatter(p, t);
  col += scatter * (0.5 + fog * 0.5);
  
  // God rays / light shafts - simplified
  vec2 rayDir = p - vec2(0.0, 0.8);
  float rayDist = length(rayDir);
  float rayAngle = atan(rayDir.y, rayDir.x);
  float rays = (sin(rayAngle * 8.0 + t * 0.5) * 0.5 + 0.5) * exp(-rayDist * 1.5) * fog;
  col += vec3(0.2, 0.3, 0.5) * rays * 0.12;
  
  // Subtle bright wisps
  float wisp = pow(max(0.0, n1 * n2), 2.0) * 0.15;
  col += vec3(0.2, 0.4, 0.6) * wisp;
  
  // Mobile detection for star adjustments
  bool isMobile = u_resolution.x < 600.0;
  
  // Floating particles / stars (dimmed by fog)
  float starScale = isMobile ? 60.0 : 120.0; // Fewer, larger stars on mobile
  vec2 starUv = uv * starScale;
  vec2 starId = floor(starUv);
  vec2 starF = fract(starUv) - 0.5;
  float starRand = fract(sin(dot(starId, vec2(12.9898, 78.233))) * 43758.5453);
  float starSize = isMobile ? 0.06 : 0.04;
  float star = smoothstep(starSize, 0.0, length(starF)) * step(0.90, starRand);
  float starTwinkle = sin(t * 2.0 + starRand * 6.28) * 0.3 + 0.7;
  
  // Vary star colors slightly
  vec3 starColor = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.9, 0.8), starRand * starRand);
  float starBrightness = isMobile ? 0.8 : 0.55;
  col += star * starTwinkle * starColor * starBrightness * (1.0 - fog * 0.5);
  
  // Distant dense star field (galaxy dust) - skip on mobile for performance
  if (!isMobile) {
    vec2 dustUv = uv * 300.0;
    vec2 dustId = floor(dustUv);
    vec2 dustF = fract(dustUv) - 0.5;
    float dustRand = fract(sin(dot(dustId, vec2(41.123, 17.456))) * 28461.312);
    float dust = smoothstep(0.08, 0.0, length(dustF)) * step(0.85, dustRand);
    col += dust * vec3(0.5, 0.5, 0.6) * 0.2 * (1.0 - fog * 0.8);
  }
  
  // Subtle milky way band
  float galaxyBand = exp(-pow(p.y * 1.5 + p.x * 0.3, 2.0) * 3.0);
  float galaxyNoise = snoise(p * 2.0 + vec2(100.0, 200.0)) * 0.5 + 0.5;
  vec3 galaxyColor = mix(vec3(0.08, 0.06, 0.12), vec3(0.12, 0.10, 0.18), galaxyNoise);
  col += galaxyColor * galaxyBand * galaxyNoise * 0.35 * (1.0 - fog * 0.6);
  
  // Radial gradient - darker at edges, slightly brighter center
  float vignette = 1.0 - pow(length(p) * 0.5, 2.0);
  col *= 0.7 + vignette * 0.5;
  
  // Subtle central glow enhanced by fog
  float centerGlow = exp(-length(p) * 1.5) * 0.1;
  col += vec3(0.3, 0.4, 0.6) * centerGlow * (1.0 + fog);
  
  // Final adjustments
  col = pow(col, vec3(0.95)); // Slight gamma lift
  col *= 0.9;
  
  gl_FragColor = vec4(col, 1.0);
}
