import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.value='';this.listeners={};this.attributes={};this.dataset={};this.classList={add(){}};this.hidden=true;}
 get childNodes(){return this.children;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,v){this.listeners[k]=v;}
}
const code=readFileSync('assets/js/offline.js','utf8');
const data=JSON.parse(readFileSync('data/papers.json','utf8'));
async function run(slug){
 const nodes={};
 for(const name of ['#papers','#results-status','#search','#category','.filters','#total','#load-status'])nodes[name]=new Element();
 if(slug!==undefined)nodes['#paper']=new Element('article');
 const document={title:'',querySelector:s=>nodes[s]||null,createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t),createTextNode:t=>{const n=new Element('#text');n.textContent=t;return n;}};
 await vm.runInNewContext(code,{document,location:{protocol:'file:',search:slug===undefined?'':'?slug='+encodeURIComponent(slug)},URL,URLSearchParams,fetch(){throw Error('Offline reader must never fetch');}}, {timeout:3000});
 return {nodes,document};
}
const home=await run();assert.equal(home.nodes['#papers'].children.length,data.length);
home.nodes['#search'].value='hSv3';home.nodes['#search'].listeners.input();assert.equal(home.nodes['#papers'].children.length,1);assert.equal(home.nodes['#results-status'].textContent,`顯示 1 / ${data.length} 篇論文`);
home.nodes['#category'].value='Networking';home.nodes['#category'].listeners.change();assert.equal(home.nodes['#results-status'].textContent,`顯示 0 / ${data.length} 篇論文`);
home.nodes['.filters'].listeners.reset();assert.equal(home.nodes['#papers'].children.length,data.length);
function descendants(n){return[n,...n.children.flatMap(descendants)];}
let equations=0;
for(const p of data){const {nodes,document}=await run(p.slug);assert.equal(nodes['#paper'].hidden,false);assert.equal(nodes['#paper'].children.filter(n=>n.tag==='section').length,8);assert.equal(document.title,p.title+'｜PaperNotes');const math=descendants(nodes['#paper']).filter(n=>n.tag==='math');equations+=math.length;assert.ok(!descendants(nodes['#paper']).some(n=>n.dataset.fallback));const expectedTables=(p.experiments.match(/^表格：/gm)||[]).length;assert.equal(descendants(nodes['#paper']).filter(n=>n.tag==='table').length,expectedTables);}
const expectedEquations=data.reduce((sum,p)=>sum+['summary','motivation','method','experiments','limitations','takeaways'].reduce((n,k)=>n+[...p[k].matchAll(/\$\$([\s\S]*?)\$\$/g)].length,0),0);
assert.equal(equations,expectedEquations);
for(const slug of ['learning-a-deep-convolutional-network-for-image-super-resolution','learning-deep-cnn-denoiser-prior-for-image-restoration']) assert.match((await run(slug)).nodes['#load-status'].textContent,/找不到/);
assert.match((await run('unknown')).nodes['#load-status'].textContent,/找不到/);
for(const [protocol,expected]of [['file:','assets/js/offline.js'],['http:','assets/js/app.js']]){
 const scripts=[];vm.runInNewContext(readFileSync('assets/js/boot.js','utf8'),{location:{protocol},document:{createElement:()=>({}),querySelector:()=>null,head:{append:s=>scripts.push(s)}}});assert.equal(scripts[0].src,expected);
}
console.log(`PASS: file-mode boot, ${data.length} offline cards/detail routes, search, filters, reset, ${equations} formulas, removed/unknown slugs; no fetch calls.`);
