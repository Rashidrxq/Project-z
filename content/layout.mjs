export const origin = 'https://project-z-atlas.vercel.app';
export const email = 'rashid.mhd.pp@gmail.com';
export const repo = 'https://github.com/Rashidrxq/Project-z';
const links = [['Services','/services/'],['About','/about/'],['Careers','/careers/'],['Insights','/insights/']];
const brand = '<a class="brand" href="/" aria-label="Project Z home"><i class="mark" aria-hidden="true"></i>PROJECT Z</a>';
export const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const nav = route => links.map(([name,url]) => `<a href="${url}"${route.startsWith(url) ? ' aria-current="'+(route===url?'page':'location')+'"' : ''}>${name}</a>`).join('');
export const arrow = '<span aria-hidden="true">↗</span>';
export const action = (url,label) => `<a class="action" href="${url}">${label} ${arrow}</a>`;
export const eyebrow = label => `<div class="eyebrow"><i></i>${label}</div>`;
export const mast = (category, title, lead) => `<section class="mast shell">${eyebrow(category)}<h1>${title}</h1><p>${lead}</p></section>`;
export const inquiry = () => `<aside class="inquiry shell"><div>${eyebrow('Project enquiries')}<h2>What are you <em>building?</em></h2></div>${action('/contact/','Get a quote')}</aside>`;
export function layout(route, title, description, body) {
  const home=route==='/';
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090c10">
<title>${escape(title)} — Project Z</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin+route}">
<meta property="og:type" content="${route.startsWith('/insights/') && route!=='/insights/'?'article':'website'}"><meta property="og:title" content="${escape(title)} — Project Z"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin+route}"><meta property="og:image" content="${origin}/assets/world-0.webp">
<link rel="icon" href="/assets/mark.svg"><link rel="preload" as="font" type="font/woff" href="/assets/archivo.woff" crossorigin>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/company.css">
${home?'<link rel="preload" as="image" href="/assets/world-0.webp"><script type="module" src="/src/main.js"></script>':''}
<script type="module" src="/src/company.js"></script></head><body>
<a class="skip" href="${home?'#capabilities':'#main'}">${home?'Skip expedition':'Skip to content'}</a>
<header class="site-head">${brand}<nav aria-label="Main navigation">${nav(route)}</nav><div class="head-actions"><a class="contact-link" href="/contact/"><i></i>Get a quote</a>
<details class="mobile-menu"><summary>Menu</summary><nav aria-label="Mobile navigation">${nav(route)}</nav></details></div></header>
<main id="main">${body}</main>
<footer class="shell">${brand}<span>Kozhikode, Kerala · India</span><nav aria-label="Footer navigation">${nav(route)}<a href="/contact/">Contact</a></nav></footer>
</body></html>`;
}
