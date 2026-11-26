import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {layout,origin} from '../content/layout.mjs';
import {services,notes} from '../content/editorial.mjs';
import {home,serviceIndex,servicePage,about,careers,contact,article,insights} from '../content/pages.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
const out = join(root,'dist');
await mkdir(out,{recursive:true});
const atlas = await readFile(join(root,'content','expedition.html'),'utf8');
const routes = [
  ['/', 'Digital frontiers', 'Independent IT company in Kozhikode, Kerala. Explore web platforms, workflow automation, and immersive web development.', home(atlas)],
  ['/services/', 'IT services and solutions', 'Explore three engineering services, project deliverables and examples from Project Z.', serviceIndex()],
  ...services.map((s,i)=>['/services/'+s.slug+'/',s.label,s.lead,servicePage(s,i)]),
  ['/about/', 'About our studio', 'Meet founder Muhammed Rashid P P and learn how our independent IT studio in Kozhikode works.', about()],
  ['/careers/', 'Careers and internships', 'Read about open roles, internship and apprenticeship interest, engineering culture, and the hiring process.', careers()],
  ['/insights/', 'Engineering field notes', 'Engineering notes on browser graphics, workflow design, and practical software delivery.', insights()],
  ...notes.map(n=>['/insights/'+n.slug+'/',n.title,n.summary,article(n)]),
  ['/contact/', 'Contact and project quotes', 'Prepare a brief for a software project or contact the Project Z studio directly.', contact()]
];
for (const name of ['style.css','company.css','src','assets']) await cp(join(root,name),join(out,name),{recursive:true});
for (const [path,title,description,body] of routes){
  const dir = join(out,path);
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,'index.html'),layout(path,title,description,body));
}
await writeFile(join(out,'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(([path])=>'<url><loc>'+origin+path+'</loc></url>').join('')+'</urlset>');
await writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
console.log('Built '+routes.length+' pages');
