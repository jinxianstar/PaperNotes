// Dependency-free data and local PDF coverage audit. Run at the repository root.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
const dataModule=readFileSync('assets/js/data.js','utf8');
const {validatePapers,matchesPaper,safeUrl}=await import('data:text/javascript;base64,'+Buffer.from(dataModule).toString('base64'));
const papers=validatePapers(JSON.parse(readFileSync('data/papers.json','utf8')));
const normalize=value=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
assert.equal(new Set(papers.map(p=>normalize(p.title))).size,papers.length,'Duplicate normalized paper title');
const dois=papers.filter(p=>p.doi).map(p=>p.doi.toLowerCase());
assert.equal(new Set(dois).size,dois.length,'Duplicate DOI');
for(const p of papers){
 assert.ok(matchesPaper(p,p.title.toUpperCase(),p.category),`Title/category search failed: ${p.slug}`);
 assert.ok(!matchesPaper(p,p.title,'no-such-category'));
 assert.ok(existsSync('paper.html'),'Missing shared detail template');
}
assert.equal(safeUrl('javascript:alert(1)'), '');
assert.throws(()=>validatePapers([...papers,papers[0]]));
const manifest=JSON.parse(readFileSync('data/import-manifest.json','utf8'));
const slugs=new Set(papers.map(p=>p.slug));
for(const source of manifest.sources){
 assert.ok(slugs.has(source.slug),`Source has no note: ${source.file}`);
 assert.equal(source.pagesRead.length,source.pages);
 assert.deepEqual(source.pagesRead,Array.from({length:source.pages},(_,i)=>i+1));
}
const pdfs=[];
function scan(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=path.posix.join(dir,e.name);if(e.isDirectory())scan(p);else if(e.isFile()&&/\.pdf$/i.test(e.name))pdfs.push(p);}}
if(existsSync('references')){
 scan('references');
 assert.deepEqual([...new Set(manifest.sources.map(s=>s.file))].sort(),pdfs.sort(),'PDF coverage mismatch; reimport changed or new sources');
 assert.equal(manifest.sources.length,pdfs.length,'Duplicate source path');
 for(const source of manifest.sources){assert.equal(createHash('sha256').update(readFileSync(source.file)).digest('hex'),source.sha256,`Changed source PDF: ${source.file}`);}
 console.log(`PASS: ${pdfs.length} local PDFs covered with matching SHA-256 and full page inventory.`);
}else console.log('SKIP: local PDF hashes (references/ is absent, as expected in public checkout).');
assert.ok(readFileSync('.gitignore','utf8').split(/\r?\n/).includes('/references/'),'references/ must be ignored');
if(existsSync('.git')){
 const tracked=execFileSync('git',['ls-files','-z','--','references'],{encoding:'utf8'}).split('\0').filter(Boolean);
 assert.equal(tracked.length,0,'references/ files already tracked: .gitignore does not untrack them; remove from index without deleting local originals');
}
for(const file of ['index.html','paper.html','assets/js/app.js','assets/js/paper.js','assets/js/data.js','assets/js/math.js']){
 const text=readFileSync(file,'utf8');
 assert.ok(!/\binnerHTML\b/.test(text),`Unsafe rendering: ${file}`);
 assert.ok(!/(?:src|href)=["']\//.test(text),`Root-absolute URL: ${file}`);
}
const workflow=readFileSync('.github/workflows/deploy-pages.yml','utf8');
assert.ok(workflow.includes('cp -R assets data _site/'),'Review deployment allowlist');
assert.ok(!/cp[^\n]*(?:references|\*|\.\s)/.test(workflow),'Deployment must not copy source PDFs or whole checkout');
console.log(`PASS: ${papers.length} schema-valid unique notes, title/category search, sources, safe rendering, relative URLs and publication exclusions.`);
