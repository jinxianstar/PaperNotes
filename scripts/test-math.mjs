import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMath,appendContent} from '../assets/js/math.js';
// Minimal DOM for structure/safety tests; browser layout is verified separately.
class TestNode {
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.textContent='';}
  append(...items){this.children.push(...items);}
  setAttribute(key,value){this.attributes[key]=value;}
}
globalThis.document={createElement:tag=>new TestNode(tag),createElementNS:(_,tag)=>new TestNode(tag)};
function all(node){return [node,...node.children.flatMap(all)];}
const fraction=createMath(String.raw`\frac{1}{1+\frac{x_i^2}{y}}`);
assert.equal(all(fraction).filter(n=>n.tag==='mfrac').length,2);
assert.ok(all(fraction).some(n=>n.tag==='msubsup'));
assert.throws(()=>createMath(String.raw`\frac{x}{`));
assert.throws(()=>createMath(String.raw`\unsupported{x}`));
const source=JSON.parse(readFileSync('data/papers.json','utf8'));
let count=0;
for(const p of source){
 for(const field of ['summary','motivation','method','experiments','limitations','takeaways']){
  const matches=[...p[field].matchAll(/\$\$([\s\S]*?)\$\$/g)];
  for(const match of matches){createMath(match[1]);count++;}
  const parent=new TestNode('section');appendContent(parent,p[field]);
  assert.equal(all(parent).filter(n=>n.tag==='math').length,matches.length,`Lost formula in ${p.slug}/${field}`);
  assert.ok(!all(parent).some(n=>n.dataset.fallback),'Unexpected formula fallback');
 }
}
const parent=new TestNode('section');
appendContent(parent,'<img src=x onerror=alert(1)>\n$$\\unsupported{x}$$');
assert.equal(parent.children[0].tag,'p');
assert.equal(parent.children[0].textContent,'<img src=x onerror=alert(1)>');
assert.equal(parent.children[1].dataset.fallback,'true');
assert.ok(!all(parent).some(n=>n.tag==='img'));
console.log(`PASS: ${count} equations parse; nested fractions/scripts, plain-text safety and unsupported-syntax fallback verified.`);

const resultSection=new TestNode('section');
const loadPaper=source.find(p=>p.slug.startsWith('larsi-tpe-xgb-'));
appendContent(resultSection,loadPaper.experiments);
const tables=all(resultSection).filter(n=>n.tag==='table');
assert.equal(tables.length,6,'LARSI results must have six readable tables');
assert.ok(tables.every(t=>t.children.some(n=>n.tag==='caption')));
const tableCells=t=>all(t).filter(n=>n.tag==='td').map(n=>n.textContent);
assert.deepEqual(tableCells(tables[0]),['1387.64','1781.00','2.73%','1272.22','1652.43','2.52%','1096.32','1450.00','2.15%']);
assert.deepEqual(tableCells(tables[1]),['846.78','1361.85','3.00%','808.40','1263.71','2.85%','640.25','943.24','2.23%']);
assert.deepEqual(tableCells(tables[4]),['289.02','404.88','4.13%','254.08','348.62','3.62%','249.06','337.03','3.57%']);
assert.ok(all(tables[2]).some(n=>n.textContent==='5.804×10⁻¹¹'));
assert.ok(all(tables[3]).some(n=>n.textContent==='3.33×10⁻²'));
const unsafeTable=new TestNode('section');appendContent(unsafeTable,'表格：安全測試\n| 名稱 | 值 |\n| --- | --- |\n| <script>alert(1)</script> | 42 |');
assert.equal(all(unsafeTable).filter(n=>n.tag==='table').length,1);
assert.ok(all(unsafeTable).some(n=>n.tag==='th'&&n.textContent==='<script>alert(1)</script>'));
assert.ok(!all(unsafeTable).some(n=>n.tag==='script'));
console.log('PASS: six source-captioned result tables, exact metric cells, p-values and safe table text.');

let totalTables=0;
for(const paper of source){
 const section=new TestNode('section');appendContent(section,paper.experiments);
 const rendered=all(section).filter(n=>n.tag==='table');
 const expected=(paper.experiments.match(/^表格：/gm)||[]).length;
 assert.ok(expected>0,`Missing authored tables: ${paper.title}`);
 assert.equal(rendered.length,expected,`Missing result tables: ${paper.title}`);
 for(const table of rendered){
  assert.ok(all(table).some(n=>n.tag==='caption'&&n.textContent.includes('PDF 第')),'Missing source page');
  const head=all(table).find(n=>n.tag==='thead');const columns=all(head).filter(n=>n.tag==='th').length;
  const body=all(table).find(n=>n.tag==='tbody');
  assert.ok(body.children.every(row=>row.children.length===columns),'Misaligned table columns');
  assert.ok(body.children.every(row=>row.children[0].attributes.scope==='row'));
 }
 totalTables+=rendered.length;
}
assert.equal(totalTables,source.reduce((sum,p)=>sum+(p.experiments.match(/^表格：/gm)||[]).length,0));
console.log(`PASS: ${source.length} papers have ${totalTables} source-captioned tables with aligned columns and row headers.`);

const ensemble=source.find(p=>p.slug.startsWith('enhancing-internet-traffic-'));
if(ensemble){const section=new TestNode('section');appendContent(section,ensemble.experiments);const t=all(section).filter(n=>n.tag==='table');assert.equal(t.length,3);assert.equal(all(t[1]).filter(n=>n.tag==='tbody')[0].children.length,12);assert.deepEqual(tableCells(t[2]).slice(-4),['5.69','0.00','8.64','0.00']);assert.deepEqual(tableCells(t[1]).slice(-3),['24','6.99','10.02']);console.log('PASS: new ensemble paper has 12 baseline rows and original NNCT result cells.');}
