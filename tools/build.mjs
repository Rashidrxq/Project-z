import {cp, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=join(root,'dist');
await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','src','assets']){
  await cp(join(root,name),join(out,name),{recursive:true});
}
