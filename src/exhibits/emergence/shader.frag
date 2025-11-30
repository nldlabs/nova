precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_population;
uniform float u_cohesion;
uniform float u_trailLength;
uniform float u_colorShift;
uniform float u_size;

#define PI 3.14159265359
#define TAU 6.28318530718

// Fast hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// Simplex noise for fog
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

// Color palette
vec3 palette(float t) {
  t += u_colorShift;
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.1, 0.2);
  return a + b * cos(TAU * (c * t + d));
}

// Agent position - efficient swirling motion without loops
vec2 getAgentPos(float id, float time) {
  vec2 seed = vec2(id * 1.234, id * 5.678);
  vec2 h = hash2(seed);
  vec2 h2 = hash2(seed + 100.0);
  
  float t = time * 0.25;
  
  // Base position that drifts slowly
  vec2 center = (h - 0.5) * 1.6;
  center.x += sin(t * 0.1 + id) * 0.3;
  center.y += cos(t * 0.13 + id * 1.3) * 0.3;
  
  // Swirling orbit around the drifting center
  float orbitSpeed = 0.4 + h.x * 0.3;
  float orbitSize = 0.15 + h.y * 0.2;
  float phase = h2.x * TAU + t * orbitSpeed;
  
  // Add second harmonic for more interesting paths
  float phase2 = h2.y * TAU + t * orbitSpeed * 1.7;
  
  vec2 pos = center;
  pos.x += cos(phase) * orbitSize + cos(phase2) * orbitSize * 0.4;
  pos.y += sin(phase) * orbitSize + sin(phase2 * 1.3) * orbitSize * 0.3;
  
  // Swirl interaction - agents near mouse orbit it
  vec2 mouse = (u_mouse - 0.5) * 2.0;
  vec2 toMouse = mouse - pos;
  float dist = length(toMouse);
  
  if (dist < 0.8 && u_cohesion > 0.01) {
    // Spiral toward mouse
    float swirlAngle = atan(toMouse.y, toMouse.x) + t * 2.0 + id * 0.2;
    float swirlDist = dist * (0.7 + 0.3 * sin(t + id));
    vec2 swirlPos = mouse + vec2(cos(swirlAngle), sin(swirlAngle)) * swirlDist * 0.5;
    pos = mix(pos, swirlPos, u_cohesion * (1.0 - dist / 0.8) * 0.6);
  }
  
  // Wrap to bounds
  pos = mod(pos + 1.0, 2.0) - 1.0;
  
  return pos;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  p.x *= aspect;
  
  float time = u_time * u_speed;
  
  // Size multiplier (0.5x to 5x)
  float size = 0.5 + u_size * 4.5;
  
  // Slow time for nebula (matches gallery timing)
  float t = u_time * 0.08;
  
  // --- Nebula Background (same as gallery) ---
  
  // Warped coordinates for organic flow
  vec2 wp = p * 0.6 + vec2(snoise(p * 0.5 + t * 0.1), snoise(p * 0.5 + vec2(5.2, 1.3) - t * 0.08)) * 0.2;
  
  // Main noise layers
  float baseNoise = fbm(wp + t * 0.04);
  float n1 = baseNoise;
  float n2 = fbm(p * 0.8 - t * 0.03 + 10.0);
  
  // Base color - deep space
  vec3 col = vec3(0.01, 0.01, 0.02);
  
  // Nebula-like color bands
  vec3 color1 = vec3(0.05, 0.02, 0.08); // Deep purple
  vec3 color2 = vec3(0.02, 0.04, 0.10); // Deep blue
  vec3 color3 = vec3(0.04, 0.06, 0.08); // Teal hint
  
  // Layer the colors with noise
  float blend1 = smoothstep(-0.2, 0.5, n1);
  float blend2 = smoothstep(-0.3, 0.4, n2);
  float blend3 = smoothstep(0.0, 0.6, n1 * 0.7 + n2 * 0.3);
  
  col = mix(col, color1, blend1 * 0.6);
  col = mix(col, color2, blend2 * 0.5);
  col = mix(col, color3, blend3 * 0.3);
  
  // === VOLUMETRIC FOG (same as gallery) ===
  vec2 p1 = p * 0.6 + vec2(u_time * 0.05, u_time * 0.03);
  vec2 p2 = p * 1.0 + vec2(-u_time * 0.04, u_time * 0.025) + 10.0;
  float fog = fbm(p1) * 0.55 + fbm(p2) * 0.35;
  fog = smoothstep(0.05, 0.6, fog) * 0.7;
  
  // Nebula colors - blue, purple, and aurora green
  float colorMix = baseNoise * 0.5 + 0.5;
  float greenMix = smoothstep(0.55, 0.75, colorMix) * smoothstep(0.95, 0.7, colorMix);
  vec3 fogBlue = vec3(0.12, 0.16, 0.35);
  vec3 fogPurple = vec3(0.25, 0.10, 0.35);
  vec3 fogGreen = vec3(0.08, 0.35, 0.18);
  vec3 fogColor = mix(fogBlue, fogPurple, smoothstep(0.3, 0.7, colorMix));
  fogColor = mix(fogColor, fogGreen, greenMix * 0.4);
  
  col = mix(col, fogColor, fog * 0.55);
  
  // Light scattering through fog
  vec2 light1 = vec2(0.3, 0.6) + vec2(sin(t * 0.2), cos(t * 0.15)) * 0.2;
  vec2 light2 = vec2(-0.4, -0.3) + vec2(cos(t * 0.18), sin(t * 0.22)) * 0.15;
  float scatter1 = exp(-length(p - light1) * 2.0);
  float scatter2 = exp(-length(p - light2) * 2.5);
  vec3 lightCol1 = vec3(0.3, 0.5, 0.8) * scatter1;
  vec3 lightCol2 = vec3(0.5, 0.3, 0.6) * scatter2;
  col += (lightCol1 + lightCol2) * 0.4 * (0.5 + fog * 0.5);
  
  // God rays
  vec2 rayDir = p - vec2(0.0, 0.8);
  float rayDist = length(rayDir);
  float rayAngle = atan(rayDir.y, rayDir.x);
  float rays = (sin(rayAngle * 8.0 + t * 0.5) * 0.5 + 0.5) * exp(-rayDist * 1.5) * fog;
  col += vec3(0.2, 0.3, 0.5) * rays * 0.12;
  
  // Subtle bright wisps
  float wisp = pow(max(0.0, n1 * n2), 2.0) * 0.15;
  col += vec3(0.2, 0.4, 0.6) * wisp;
  
  // Stars
  float starScale = 120.0;
  vec2 starUv = uv * starScale;
  vec2 starId = floor(starUv);
  vec2 starF = fract(starUv) - 0.5;
  float starRand = fract(sin(dot(starId, vec2(12.9898, 78.233))) * 43758.5453);
  float star = smoothstep(0.04, 0.0, length(starF)) * step(0.90, starRand);
  float starTwinkle = sin(t * 2.0 + starRand * 6.28) * 0.3 + 0.7;
  vec3 starColor = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.9, 0.8), starRand * starRand);
  col += star * starTwinkle * starColor * 0.55 * (1.0 - fog * 0.5);
  
  // Dense star dust
  vec2 dustUv = uv * 300.0;
  vec2 dustId = floor(dustUv);
  vec2 dustF = fract(dustUv) - 0.5;
  float dustRand = fract(sin(dot(dustId, vec2(41.123, 17.456))) * 28461.312);
  float dust = smoothstep(0.08, 0.0, length(dustF)) * step(0.85, dustRand);
  col += dust * vec3(0.5, 0.5, 0.6) * 0.2 * (1.0 - fog * 0.8);
  
  // Milky way band
  float galaxyBand = exp(-pow(p.y * 1.5 + p.x * 0.3, 2.0) * 3.0);
  float galaxyNoise = snoise(p * 2.0 + vec2(100.0, 200.0)) * 0.5 + 0.5;
  vec3 galaxyColor = mix(vec3(0.08, 0.06, 0.12), vec3(0.12, 0.10, 0.18), galaxyNoise);
  col += galaxyColor * galaxyBand * galaxyNoise * 0.35 * (1.0 - fog * 0.6);
  
  // Central glow
  float centerGlow = exp(-length(p) * 1.5) * 0.1;
  col += vec3(0.3, 0.4, 0.6) * centerGlow * (1.0 + fog);
  
  // Detect low-power device (mobile)
  bool isMobile = u_resolution.x < 600.0;
  
  // Agent count
  int numAgents = isMobile 
    ? 20 + int(u_population * 30.0)   // 20-50 on mobile
    : 30 + int(u_population * 50.0);  // 30-80 on desktop
  
  // Trail steps
  int maxTrail = isMobile ? 4 : 6;
  float trailSteps = 1.0 + u_trailLength * float(maxTrail);
  
  // Draw agents
  for (int i = 0; i < 80; i++) {
    if (i >= numAgents) break;
    
    float id = float(i);
    vec2 agentPos = getAgentPos(id, time);
    agentPos.x *= aspect;
    
    float dist = length(p - agentPos);
    
    // Skip if too far
    if (dist > 0.15) continue;
    
    // Color
    vec3 agentCol = palette(id * 0.05 + time * 0.05);
    
    // Sharp point with size control
    float pointSize = 0.003 * size;
    float point = smoothstep(pointSize, 0.0, dist);
    col += agentCol * point;
    
    // Trail
    if (u_trailLength > 0.01) {
      for (int t = 1; t < 7; t++) {
        if (float(t) > trailSteps) break;
        
        float trailTime = time - float(t) * 0.08;
        vec2 trailPos = getAgentPos(id, trailTime);
        trailPos.x *= aspect;
        
        float trailDist = length(p - trailPos);
        if (trailDist > 0.1) continue;
        
        float fade = 1.0 - float(t) / (trailSteps + 1.0);
        float trailSize = 0.0025 * size;
        float trailPoint = smoothstep(trailSize, 0.0, trailDist) * fade;
        
        col += agentCol * trailPoint * 0.5;
      }
    }
  }
  
  // Radial gradient - darker at edges (matches gallery)
  float vignette = 1.0 - pow(length(p) * 0.5, 2.0);
  col *= 0.7 + vignette * 0.5;
  
  // Final adjustments (matches gallery)
  col = pow(col, vec3(0.95));
  col *= 0.9;
  
  gl_FragColor = vec4(col, 1.0);
}
