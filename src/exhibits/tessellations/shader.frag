precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_symmetry;
uniform float u_zoom;
uniform float u_colorShift;
uniform float u_complexity;

#define PI 3.14159265359
#define TAU 6.28318530718

// Complex number operations
vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  float d = dot(b, b);
  return vec2(dot(a, b), a.y * b.x - a.x * b.y) / d;
}

vec2 cpow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
}

// Rotation
mat2 rot2D(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// Color palette
vec3 palette(float t) {
  t += u_colorShift;
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.1, 0.2);
  return a + b * cos(TAU * (c * t + d));
}

vec3 palette2(float t) {
  t += u_colorShift;
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 0.5);
  vec3 d = vec3(0.8, 0.9, 0.3);
  return a + b * cos(TAU * (c * t + d));
}

// Kaleidoscopic fold - creates n-fold symmetry
vec2 kaleidoscope(vec2 p, float n) {
  float angle = TAU / n;
  float a = atan(p.y, p.x);
  a = mod(a, angle);
  a = abs(a - angle * 0.5);
  return length(p) * vec2(cos(a), sin(a));
}

// Hyperbolic transformation
vec2 hyperbolic(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  // Poincaré disk model transformation
  r = (1.0 - sqrt(1.0 - r * r)) / r;
  return r * vec2(cos(a), sin(a));
}

// Möbius transformation
vec2 mobius(vec2 z, vec2 a, vec2 b, vec2 c, vec2 d) {
  return cdiv(cmul(a, z) + b, cmul(c, z) + d);
}

// SDF for regular polygon
float sdPolygon(vec2 p, float r, float n) {
  float a = atan(p.y, p.x) + PI / n;
  float seg = TAU / n;
  a = mod(a, seg) - seg * 0.5;
  return length(p) * cos(a) - r * cos(PI / n);
}

// Triangle wave for patterns
float tri(float x) {
  return abs(fract(x) - 0.5) * 2.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  
  // Mouse interaction - affects center and subtle rotation
  vec2 mouse = (u_mouse - 0.5) * 2.0;
  
  // Base zoom with animation
  float zoom = u_zoom * (1.0 + 0.2 * sin(u_time * 0.1 * u_speed));
  vec2 p = uv * zoom;
  
  // Slight drift based on mouse
  p += mouse * 0.3;
  
  // Slow global rotation
  float globalRot = u_time * 0.05 * u_speed;
  p *= rot2D(globalRot);
  
  // Get symmetry order (3-12 fold)
  float sym = floor(u_symmetry * 9.0 + 3.0);
  
  // Apply kaleidoscope
  p = kaleidoscope(p, sym);
  
  // Multiple layers of patterns
  vec3 col = vec3(0.02, 0.02, 0.04);
  
  float complexity = u_complexity * 4.0 + 1.0;
  
  // Layer 1: Primary geometric pattern
  for (float i = 0.0; i < 5.0; i++) {
    if (i >= complexity) break;
    
    vec2 q = p;
    
    // Each layer has different scale and rotation
    float layerScale = 1.5 + i * 0.8;
    float layerRot = u_time * (0.1 - i * 0.02) * u_speed + i * PI / sym;
    
    q *= layerScale;
    q *= rot2D(layerRot);
    
    // Re-apply kaleidoscope at each layer for more complexity
    q = kaleidoscope(q, sym + i * 2.0);
    
    // Grid repetition
    vec2 gridId = floor(q + 0.5);
    vec2 gridUv = fract(q + 0.5) - 0.5;
    
    // Polygon at each grid cell
    float polySize = 0.35 - i * 0.03;
    float polySides = sym - i;
    float poly = sdPolygon(gridUv, polySize, max(polySides, 3.0));
    
    // Animated pulsing
    float pulse = sin(u_time * u_speed + length(gridId) * 0.5 + i) * 0.1;
    poly -= pulse * 0.05;
    
    // Color based on position and layer
    float colorIdx = (gridId.x + gridId.y) * 0.1 + i * 0.2 + u_time * 0.02;
    vec3 layerCol = mix(palette(colorIdx), palette2(colorIdx + 0.3), i / 5.0);
    
    // Sharp geometric edges with glow
    float edge = smoothstep(0.02, 0.0, abs(poly));
    float glow = 0.02 / (abs(poly) + 0.02);
    glow = pow(glow, 1.5);
    
    // Fill with gradient
    float fill = smoothstep(0.01, -0.01, poly);
    vec3 fillCol = layerCol * 0.3 * (1.0 - length(gridUv));
    
    col += layerCol * edge * (0.8 - i * 0.1);
    col += layerCol * glow * (0.15 - i * 0.02);
    col += fillCol * fill * (0.4 - i * 0.06);
  }
  
  // Layer 2: Connecting lines / sacred geometry
  {
    vec2 q = p * (2.0 + sin(u_time * 0.05 * u_speed) * 0.3);
    q *= rot2D(-globalRot * 0.5);
    q = kaleidoscope(q, sym);
    
    // Radial lines
    float angle = atan(q.y, q.x);
    float radialLines = abs(sin(angle * sym * 2.0));
    radialLines = pow(radialLines, 20.0);
    
    // Concentric circles
    float r = length(q);
    float circles = abs(sin(r * 8.0 - u_time * u_speed * 0.5));
    circles = pow(circles, 10.0);
    
    // Spiral arms
    float spiral = abs(sin(angle * 3.0 + r * 4.0 - u_time * u_speed * 0.3));
    spiral = pow(spiral, 15.0);
    
    vec3 lineCol = palette(r * 0.3 + u_time * 0.01);
    col += lineCol * radialLines * 0.15;
    col += lineCol * circles * 0.1;
    col += palette2(angle / TAU) * spiral * 0.12;
  }
  
  // Layer 3: Particle-like sparkles at vertices
  {
    vec2 q = p * 3.0;
    q *= rot2D(u_time * 0.03 * u_speed);
    q = kaleidoscope(q, sym);
    
    vec2 sparkleId = floor(q * 2.0 + 0.5);
    vec2 sparkleUv = fract(q * 2.0 + 0.5) - 0.5;
    
    // Random sparkle phase
    float sparklePhase = fract(sin(dot(sparkleId, vec2(12.9898, 78.233))) * 43758.5453);
    float sparkle = sin(u_time * u_speed * 3.0 + sparklePhase * TAU) * 0.5 + 0.5;
    sparkle = pow(sparkle, 3.0);
    
    float sparkleDist = length(sparkleUv);
    float sparkleGlow = 0.02 / (sparkleDist + 0.02);
    sparkleGlow *= sparkle;
    
    col += palette(sparklePhase + u_time * 0.05) * sparkleGlow * 0.3;
  }
  
  // Mouse proximity highlight
  float mouseDist = length(uv - mouse * 0.15);
  float mouseGlow = 0.05 / (mouseDist + 0.05);
  mouseGlow = pow(mouseGlow, 2.0) * 0.2;
  col += palette(u_time * 0.1) * mouseGlow;
  
  // Center mandala glow
  float centerDist = length(p);
  float centerGlow = 0.3 / (centerDist + 0.3);
  centerGlow = pow(centerGlow, 3.0) * 0.15;
  col += palette(u_time * 0.02) * centerGlow;
  
  // Vignette
  vec2 vignetteUv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
  float vignette = 1.0 - dot(vignetteUv * 0.5, vignetteUv * 0.5);
  col *= vignette;
  
  // Subtle noise for texture
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time) * 43758.5453);
  col += (noise - 0.5) * 0.02;
  
  // Tone mapping
  col = col / (1.0 + col * 0.5);
  
  // Gamma
  col = pow(col, vec3(0.4545));
  
  gl_FragColor = vec4(col, 1.0);
}
