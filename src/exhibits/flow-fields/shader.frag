precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_density;
uniform float u_turbulence;
uniform float u_colorShift;

#define PI 3.14159265359
#define TAU 6.28318530718

// Simple hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Value noise - much cheaper than simplex
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

// Palette
vec3 palette(float t) {
  t += u_colorShift;
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.1, 0.2);
  return a + b * cos(TAU * (c * t + d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * u_speed * 0.15;
  
  // Mouse
  vec2 mouse = u_mouse;
  mouse.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(p - mouse);
  
  // Base color
  vec3 col = vec3(0.02, 0.02, 0.05);
  
  // 3 layers of flowing particles
  for (int layer = 0; layer < 3; layer++) {
    float fl = float(layer);
    float scale = (1.5 + fl * 0.8) * u_density * 8.0;
    float layerTime = t * (1.0 - fl * 0.15);
    float brightness = 0.35 - fl * 0.08;
    
    // Scrolling offset
    vec2 scroll = vec2(layerTime * 0.4, layerTime * 0.2);
    
    // Warped coordinates for flow
    vec2 wp = p * scale + scroll;
    float warp = u_turbulence * 0.4;
    wp.x += noise(p * 2.0 + layerTime * 0.3 + fl * 10.0) * warp;
    wp.y += noise(p * 2.0 + layerTime * 0.2 + fl * 20.0 + 5.0) * warp;
    
    // Grid cell
    vec2 id = floor(wp);
    vec2 gv = fract(wp) - 0.5;
    
    // Check current cell and 4 neighbors to avoid edge clipping
    for (int ox = -1; ox <= 1; ox++) {
      for (int oy = -1; oy <= 1; oy++) {
        vec2 offs = vec2(float(ox), float(oy));
        vec2 cellId = id + offs;
        vec2 cellGv = gv - offs;
        
        // Particle in this cell
        float r = hash(cellId);
        vec2 particleOffset = vec2(hash(cellId + 0.1), hash(cellId + 0.2)) - 0.5;
        particleOffset *= 0.5;
        
        // Flow animation
        float angle = noise(cellId * 0.15 + layerTime * 0.15) * TAU;
        vec2 flow = vec2(cos(angle), sin(angle));
        float phase = fract(r * 5.0 + layerTime * 0.4);
        particleOffset += flow * (phase - 0.5) * 0.35;
        
        // Distance to particle
        float d = length(cellGv - particleOffset);
        
        // Glow
        float glow = 0.012 / (d * d + 0.012);
        glow *= sin(phase * PI); // Lifecycle fade
        glow *= brightness;
        
        // Mouse boost
        glow *= 1.0 + 1.5 * exp(-mouseDist * 5.0);
        
        // Color
        float ci = r + fl * 0.25 + layerTime * 0.08;
        ci += exp(-mouseDist * 3.0) * 0.25;
        
        col += palette(ci) * glow;
      }
    }
  }
  
  // Mouse glow
  float mg = 0.015 / (mouseDist * mouseDist + 0.015);
  col += palette(t * 0.5) * mg * 0.15;
  
  // Vignette
  vec2 vig = uv * 2.0 - 1.0;
  col *= 1.0 - dot(vig * 0.35, vig * 0.35);
  
  // Gamma
  col = pow(col, vec3(0.45));
  
  gl_FragColor = vec4(col, 1.0);
}
