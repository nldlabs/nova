precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_population;
uniform float u_cohesion;
uniform float u_trailLength;
uniform float u_colorShift;

#define PI 3.14159265359
#define TAU 6.28318530718

// Hash functions
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// Simple noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
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

// Agent position - deterministic based on ID and time
vec2 getAgentPos(float id, float time) {
  // Start position
  vec2 seed = vec2(id * 1.234, id * 5.678);
  vec2 pos = hash2(seed) * 2.0 - 1.0;
  
  // Animate through noise field
  float noiseScale = 2.0;
  float t = time * 0.5;
  
  // Use noise to determine velocity direction
  float angle = noise(pos * noiseScale + t * 0.2 + id * 0.1) * TAU * 2.0;
  angle += sin(id * 0.5 + t) * 0.5;
  
  // Integrate position over time (simplified)
  pos.x += sin(angle + t * 0.3) * 0.3 + sin(t * 0.7 + id) * 0.2;
  pos.y += cos(angle + t * 0.4) * 0.3 + cos(t * 0.5 + id * 1.3) * 0.2;
  
  // Mouse attraction
  vec2 mouse = (u_mouse - 0.5) * 2.0;
  vec2 toMouse = mouse - pos;
  pos += toMouse * u_cohesion * 0.1 / (1.0 + length(toMouse) * 2.0);
  
  // Wrap
  pos = mod(pos + 1.0, 2.0) - 1.0;
  
  return pos;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float time = u_time * u_speed;
  
  // Dark background
  vec3 col = vec3(0.01, 0.01, 0.02);
  
  // Subtle organic background
  float bg = noise(p * 3.0 + time * 0.05);
  col += vec3(0.01, 0.012, 0.015) * bg;
  
  // Number of agents - keep it reasonable!
  int numAgents = 30 + int(u_population * 50.0); // 30-80 agents max
  
  // Draw agents
  for (int i = 0; i < 80; i++) {
    if (i >= numAgents) break;
    
    float id = float(i);
    vec2 agentPos = getAgentPos(id, time);
    
    // Distance to this agent
    float dist = length(p - agentPos);
    
    // Agent glow
    float glow = 0.012 / (dist + 0.012);
    glow = glow * glow;
    
    // Color based on ID
    float colorIdx = id * 0.05 + time * 0.05;
    vec3 agentCol = palette(colorIdx);
    
    col += agentCol * glow * 0.5;
    
    // Simple trail - just a few previous positions
    float trailLen = 3.0 + u_trailLength * 5.0;
    for (float t = 1.0; t < 8.0; t += 1.0) {
      if (t > trailLen) break;
      
      vec2 trailPos = getAgentPos(id, time - t * 0.1);
      float trailDist = length(p - trailPos);
      float trailGlow = 0.006 / (trailDist + 0.006);
      float fade = 1.0 - t / trailLen;
      
      col += agentCol * trailGlow * fade * 0.25;
    }
  }
  
  // Mouse glow
  vec2 mouse = (u_mouse - 0.5) * 2.0;
  mouse.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(p - mouse);
  float mouseGlow = 0.04 / (mouseDist + 0.04);
  mouseGlow = mouseGlow * mouseGlow * 0.3 * u_cohesion;
  col += palette(time * 0.1) * mouseGlow;
  
  // Vignette
  vec2 vig = uv * 2.0 - 1.0;
  col *= 1.0 - dot(vig * 0.4, vig * 0.4);
  
  // Subtle grain
  col += (hash(p + time) - 0.5) * 0.02;
  
  // Tone map and gamma
  col = col / (1.0 + col * 0.5);
  col = pow(col, vec3(0.4545));
  
  gl_FragColor = vec4(col, 1.0);
}
