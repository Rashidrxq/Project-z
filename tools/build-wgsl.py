"""Translate this shader's small common math subset into WGSL, keeping both renderers in sync."""
from pathlib import Path
import re
src=Path(__file__).resolve().parents[1]/'src'
s=(src/'orbit.glsl').read_text().split('vec3 terrain',1)[1].split('void main()',1)[0]
s='vec3 terrain'+s
s=s.replace('vec3 terrain(vec2 uv, float world)','fn terrain(uv: vec2f, world: f32) -> vec3f').replace('vec4 shade(vec2 xy)','fn shade(xy: vec2f) -> vec4f')
for old,new in [('float','f32'),('vec2','vec2f'),('vec3','vec3f'),('vec4','vec4f')]:
 s=re.sub(r'\b'+old+r' (\w+) =',r'var \1: '+new+' =',s)
 s=s.replace(old+'(',new+'(')
s=s.replace('textureLod(atlas,coord,0.0)','textureSampleLevel(atlas,smp,coord,0.0)').replace('atan(q.x,wz)','atan2(q.x,wz)').replace('frame.','u.frame.').replace('flight.','u.flight.')
(src/'orbit.wgsl').write_text("""struct Params { frame: vec4f, flight: vec4f }
@group(0) @binding(0) var<uniform> u: Params;
@group(0) @binding(1) var atlas: texture_2d<f32>;
@group(0) @binding(2) var smp: sampler;
@vertex fn vs(@builtin(vertex_index) i:u32) -> @builtin(position) vec4f {
 let x=f32((i << 1u) & 2u); let y=f32(i & 2u);
 return vec4f(2.0*x-1.0,2.0*y-1.0,0.0,1.0);
}
"""+s+"""
@fragment fn fs(@builtin(position) p:vec4f) -> @location(0) vec4f {
 return shade(vec2f(p.x/u.frame.x,1.0-p.y/u.frame.y));
}
""")
