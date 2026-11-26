"""Generate original planetary atlases and transparent stills from the same orbital model."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter
out=Path(__file__).resolve().parents[1]/'assets'
rng=np.random.default_rng(3287)
W,H=960,480
yy,xx=np.mgrid[:H,:W]/np.array([H,W])[:,None,None]
def noise(scale):
    grid=rng.random((scale,2*scale)).astype(np.float32)
    return map_coordinates(grid,[yy*scale,xx*2*scale],order=3,mode='grid-wrap')
def palette(v,stops):
    ts=np.linspace(0,1,len(stops))
    return np.stack([np.interp(np.clip(v,0,1),ts,[c[i] for c in stops]) for i in range(3)],-1)
maps=[]
for k,stops in enumerate([[(36,17,12),(103,49,27),(160,86,51),(214,145,93),(243,202,156),(255,232,194)],[(11,36,46),(26,75,88),(65,120,125),(145,181,170),(218,227,199)],[(41,24,32),(91,50,64),(151,79,83),(193,126,106),(237,194,152)]]):
    a,b,c,f=noise(4),noise(12),noise(36),noise(95)
    wave=yy+(.047 if k==0 else .095)*(a-.5)+.025*np.sin(2*np.pi*xx+5*b)+.016*b+.004*c
    val=.51+.20*np.sin(wave*(80 if k==0 else 29))+.085*np.sin(wave*350+3*c)+.055*np.sin(wave*809)+.22*(b-.5)+.12*(c-.5)+.08*(f-.5)+rng.normal(0,.018,(H,W))
    if k:val=.55+.24*np.sin(18*a+7*b+2*c)+.11*np.sin(36*a+8*b+3*f)+.13*(f-.5)
    maps.append(palette(val,stops).astype('uint8'))
Image.fromarray(np.vstack(maps)).save(out/'surfaces.webp',quality=89)
def smooth(a,b,x):
    t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)
def ring_bands(r):
    return (.68+.18*np.sin(r*181)+.10*np.sin(r*438)+.04*np.sin(r*920))*(1-.88*np.exp(-((r-1.73)/.030)**2))*(1-.5*np.exp(-((r-1.93)/.018)**2))
def render(k):
    w,h=1080,720
    j,i=np.mgrid[:h,:w]
    x=(i+.5-w/2)/w*4.22;y=(h/2-j-.5)/w*4.22
    rho=np.hypot(x,y);z=np.sqrt(np.maximum(0,1-rho*rho));edge=smooth(1.004,.998,rho)
    angle=[.34,-.20,.48][k];co,si=np.cos(angle),np.sin(angle)
    u=x*co+y*si;v=-x*si+y*co;tilt=[.26,.41,.19][k];r=np.hypot(u,v/tilt)
    band=ring_bands(r);ring=smooth(1.14,1.24,r)*(1-smooth(1.99,2.05,r))*band*[1,.54,.78][k]
    depth=-(v/tilt)*np.sqrt(1-tilt*tilt);front=depth>z
    light=np.array([-.64,.63,.44]);light/=np.linalg.norm(light)
    dot=np.maximum(0,x*light[0]+y*light[1]+z*light[2])
    lon=np.arctan2(u,z);lat=np.arcsin(np.clip(v,-1,1))
    texture=maps[k][np.minimum(H-1,((.5-lat/np.pi)*H).astype(int)),((lon/(2*np.pi)+.5)*W).astype(int)%W]/255.
    lightfac=.095+1.02*dot**.78
    color=texture*lightfac[...,None]
    ray=x*light[0]+y*light[1]+depth*light[2]
    shadow=(ray<0)&((x*x+y*y+depth*depth-ray*ray)<1)
    rc=np.array([[.90,.70,.49],[.63,.81,.79],[.85,.65,.65]][k])*(.44+.52*band[...,None])*(1-.74*shadow[...,None])
    ring=np.where((edge>.5)&~front,0,ring);alpha=ring+edge*(1-ring)
    rgb=(rc*ring[...,None]+color*edge[...,None]*(1-ring[...,None]))/np.maximum(.00001,alpha[...,None])
    rim=np.exp(-np.maximum(0,rho-1)*67)*.20*(1-edge)*np.clip(.45+.5*(-x+y),0,1)
    rgb=(rgb*alpha[...,None]+np.array([.95,.64,.41])*rim[...,None]*(1-alpha[...,None]))/np.maximum(1e-6,(alpha+rim*(1-alpha))[...,None]);alpha+=rim*(1-alpha)
    img=np.dstack([rgb,alpha]);Image.fromarray((255*np.clip(img,0,1)).astype('uint8')).save(out/f'world-{k}.webp',quality=91,method=5)
for k in range(3):render(k)
w,h=1440,900
a=np.zeros((h,w,3),np.float32);y,x=np.mgrid[:h,:w]
cloud=gaussian_filter(rng.normal(0,1,(h,w)),18);cloud/=cloud.std()
stripe=np.exp(-((y/h-.49+.28*(x/w-.65))/.30)**2)*np.exp(-((x/w-.70)/.35)**2)
a[:]=[7,10,14];a+=stripe[...,None]*(np.array([12,8,7])+cloud[...,None]*1.9);a+=rng.normal(0,1.45,(h,w,1))
for k in range(2400):
    cy,cx=rng.integers(1,h-1),rng.integers(1,w-1);mag=min(165,rng.exponential(22)+14)
    a[cy,cx]+=mag*np.array([1,.98,.9])
    if mag>85:
        a[cy-1:cy+2,cx]+=mag*.12;a[cy,cx-1:cx+2]+=mag*.12
Image.fromarray(np.uint8(np.clip(a,0,255))).save(out/'deep-field.webp',quality=86)
