#version 300 es
precision highp float;
uniform vec4 frame; // width, height, longitude, latitude
uniform vec4 flight; // journey progress, detail, elapsed time, reserved
uniform sampler2D atlas;
out vec4 pixel;

vec3 terrain(vec2 uv, float world) {
    vec2 coord = vec2(fract(uv.x), (clamp(uv.y,0.002,0.998)+world)/3.0);
    return textureLod(atlas,coord,0.0).rgb;
}
vec4 shade(vec2 xy) {
    float ar = frame.x/frame.y;
    float journey = clamp(flight.x,0.0,2.0);
    float a = min(floor(journey),1.0);
    float blend = smoothstep(0.0,1.0,journey-a);
    float k1 = smoothstep(0.0,1.0,journey);
    float k2 = smoothstep(1.0,2.0,journey);
    float angle = 0.34-0.54*k1+0.68*k2+0.12*sin(frame.z);
    float tilt = clamp(0.26+0.15*k1-0.22*k2+0.15*sin(frame.w),0.12,0.59);
    vec2 p = (xy-vec2(0.5))*vec2(ar,1.0)*max(4.22/ar,2.813333);
    p = p*(1.0-0.11*sin(3.14159*journey)*sin(3.14159*journey));
    vec2 axis = vec2(cos(angle),sin(angle));
    vec2 q = vec2(dot(p,axis),dot(p,vec2(-axis.y,axis.x)));
    float radius = length(p);
    float aa = max(0.002,3.0/frame.y);
    float globe = 1.0-smoothstep(1.0-aa,1.0+aa,radius);
    float z = sqrt(max(0.0,1.0-dot(p,p)));
    float r = length(vec2(q.x,q.y/tilt));
    float depth = -q.y*sqrt(1.0-tilt*tilt)/tilt;
    float fine = smoothstep(0.45,0.95,flight.y);
    float bands = (0.68+0.18*sin(r*181.0)+fine*(0.10*sin(r*438.0)+0.04*sin(r*920.0)))*(1.0-0.88*exp(-pow(abs(r-1.73)/0.030,2.0)))*(1.0-0.50*exp(-pow(abs(r-1.93)/0.018,2.0)));
    float ring = smoothstep(1.14,1.24,r)*(1.0-smoothstep(1.99,2.05,r))*bands*(1.0-0.46*k1+0.24*k2);
    vec3 light = normalize(vec3(-0.64,0.63,0.44));
    float projection = dot(vec3(p,depth),light);
    float shadow = (1.0-step(0.0,projection))*(1.0-smoothstep(0.96,1.04,dot(p,p)+depth*depth-projection*projection));
    vec3 dust = mix(mix(vec3(0.90,0.70,0.49),vec3(0.63,0.81,0.79),k1),vec3(0.85,0.65,0.65),k2)*(0.44+0.52*bands)*(1.0-0.74*shadow);
    float lat = q.y*cos(frame.w)-z*sin(frame.w);
    float wz = z*cos(frame.w)+q.y*sin(frame.w);
    vec2 tex = vec2(0.5+atan(q.x,wz)/6.283185+frame.z/6.283185,0.5-asin(clamp(lat,-1.0,1.0))/3.141593);
    vec3 crust = mix(terrain(tex,a),terrain(tex,a+1.0),blend);
    float sun = max(0.0,dot(vec3(p,z),light));
    vec3 surface = crust*(0.095+1.02*pow(sun,0.78));
    ring = ring*(1.0-globe*(1.0-smoothstep(-aa,aa,depth-z)));
    float alpha = ring+globe*(1.0-ring);
    vec3 rgb = dust*ring+surface*globe*(1.0-ring);
    float glow = exp(-max(0.0,radius-1.0)*67.0)*0.2*(1.0-globe)*clamp(0.45+0.5*(-p.x+p.y),0.0,1.0);
    return vec4(rgb+vec3(0.95,0.64,0.41)*glow*(1.0-alpha),alpha+glow*(1.0-alpha));
}
void main(){pixel=shade(gl_FragCoord.xy/frame.xy);}
