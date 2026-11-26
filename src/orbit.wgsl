struct Params { frame: vec4f, flight: vec4f }
@group(0) @binding(0) var<uniform> u: Params;
@group(0) @binding(1) var atlas: texture_2d<f32>;
@group(0) @binding(2) var smp: sampler;
@vertex fn vs(@builtin(vertex_index) i:u32) -> @builtin(position) vec4f {
 let x=f32((i << 1u) & 2u); let y=f32(i & 2u);
 return vec4f(2.0*x-1.0,2.0*y-1.0,0.0,1.0);
}
fn terrain(uv: vec2f, world: f32) -> vec3f {
    var coord: vec2f = vec2f(fract(uv.x), (clamp(uv.y,0.002,0.998)+world)/3.0);
    return textureSampleLevel(atlas,smp,coord,0.0).rgb;
}
fn shade(xy: vec2f) -> vec4f {
    var ar: f32 = u.frame.x/u.frame.y;
    var journey: f32 = clamp(u.flight.x,0.0,2.0);
    var a: f32 = min(floor(journey),1.0);
    var blend: f32 = smoothstep(0.0,1.0,journey-a);
    var k1: f32 = smoothstep(0.0,1.0,journey);
    var k2: f32 = smoothstep(1.0,2.0,journey);
    var angle: f32 = 0.34-0.54*k1+0.68*k2+0.12*sin(u.frame.z);
    var tilt: f32 = clamp(0.26+0.15*k1-0.22*k2+0.15*sin(u.frame.w),0.12,0.59);
    var p: vec2f = (xy-vec2f(0.5))*vec2f(ar,1.0)*max(4.22/ar,2.813333);
    p = p*(1.0-0.11*sin(3.14159*journey)*sin(3.14159*journey));
    var axis: vec2f = vec2f(cos(angle),sin(angle));
    var q: vec2f = vec2f(dot(p,axis),dot(p,vec2f(-axis.y,axis.x)));
    var radius: f32 = length(p);
    var aa: f32 = max(0.002,3.0/u.frame.y);
    var globe: f32 = 1.0-smoothstep(1.0-aa,1.0+aa,radius);
    var z: f32 = sqrt(max(0.0,1.0-dot(p,p)));
    var r: f32 = length(vec2f(q.x,q.y/tilt));
    var depth: f32 = -q.y*sqrt(1.0-tilt*tilt)/tilt;
    var fine: f32 = smoothstep(0.45,0.95,u.flight.y);
    var bands: f32 = (0.68+0.18*sin(r*181.0)+fine*(0.10*sin(r*438.0)+0.04*sin(r*920.0)))*(1.0-0.88*exp(-pow(abs(r-1.73)/0.030,2.0)))*(1.0-0.50*exp(-pow(abs(r-1.93)/0.018,2.0)));
    var ring: f32 = smoothstep(1.14,1.24,r)*(1.0-smoothstep(1.99,2.05,r))*bands*(1.0-0.46*k1+0.24*k2);
    var light: vec3f = normalize(vec3f(-0.64,0.63,0.44));
    var projection: f32 = dot(vec3f(p,depth),light);
    var shadow: f32 = (1.0-step(0.0,projection))*(1.0-smoothstep(0.96,1.04,dot(p,p)+depth*depth-projection*projection));
    var dust: vec3f = mix(mix(vec3f(0.90,0.70,0.49),vec3f(0.63,0.81,0.79),k1),vec3f(0.85,0.65,0.65),k2)*(0.44+0.52*bands)*(1.0-0.74*shadow);
    var lat: f32 = q.y*cos(u.frame.w)-z*sin(u.frame.w);
    var wz: f32 = z*cos(u.frame.w)+q.y*sin(u.frame.w);
    var tex: vec2f = vec2f(0.5+atan2(q.x,wz)/6.283185+u.frame.z/6.283185,0.5-asin(clamp(lat,-1.0,1.0))/3.141593);
    var crust: vec3f = mix(terrain(tex,a),terrain(tex,a+1.0),blend);
    var sun: f32 = max(0.0,dot(vec3f(p,z),light));
    var surface: vec3f = crust*(0.095+1.02*pow(sun,0.78));
    ring = ring*(1.0-globe*(1.0-smoothstep(-aa,aa,depth-z)));
    var alpha: f32 = ring+globe*(1.0-ring);
    var rgb: vec3f = dust*ring+surface*globe*(1.0-ring);
    var glow: f32 = exp(-max(0.0,radius-1.0)*67.0)*0.2*(1.0-globe)*clamp(0.45+0.5*(-p.x+p.y),0.0,1.0);
    return vec4f(rgb+vec3f(0.95,0.64,0.41)*glow*(1.0-alpha),alpha+glow*(1.0-alpha));
}

@fragment fn fs(@builtin(position) p:vec4f) -> @location(0) vec4f {
 return shade(vec2f(p.x/u.frame.x,1.0-p.y/u.frame.y));
}
