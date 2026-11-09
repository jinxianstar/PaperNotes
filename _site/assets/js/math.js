// Small, dependency-free TeX subset for the formulas authored in papers.json.
// Creates MathML nodes only: source text is never interpreted as HTML.
const ns = 'http://www.w3.org/1998/Math/MathML';
const symbols = {tilde:'˜',gets:'←',alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',theta:'θ',eta:'η',mu:'μ',sigma:'σ',phi:'φ',tau:'τ',Delta:'Δ',Omega:'Ω',Sigma:'Σ',pi:'π',in:'∈',le:'≤',ge:'≥',ne:'≠',approx:'≈',cdot:'·',times:'×',to:'→',infty:'∞',nabla:'∇',partial:'∂',sum:'∑',min:'min',max:'max',mean:'mean'};
function node(tag, text) {const n=document.createElementNS(ns,tag);if(text!==undefined)n.textContent=text;return n;}
export function createMath(source) {
  let i=0;
  const skip=()=>{while(/\s/.test(source[i]||'') && i<source.length)i++;};
  function group() {skip();if(source[i]==='{'){i++;const n=row('}');if(source[i]!=='}')throw Error('Missing brace');i++;return n;}return atom();}
  function atom() {
    skip();let c=source[i++];if(!c)throw Error('Missing math atom');
    if(c==='{'){i--;return group();}
    if(c==='\\') {
      let command='';while(/[a-zA-Z]/.test(source[i]||'') && i<source.length)command+=source[i++];
      if(command==='frac'){const n=node('mfrac');n.append(group(),group());return n;}
      if(command==='sqrt'){const n=node('msqrt');n.append(group());return n;}
      if(command==='hat'||command==='bar'||command==='tilde'){const n=node('mover');n.setAttribute('accent','true');n.append(group(),node('mo',command==='hat'?'^':command==='tilde'?'˜':'¯'));return n;}
      if(command==='text'||command==='mathrm') {
        skip();if(source[i++]!=='{')throw Error('Missing text brace');let text='';while(i<source.length&&source[i]!=='}')text+=source[i++];if(source[i++]!=='}')throw Error('Unclosed text');return node(command==='text'?'mtext':'mi',text);
      }
      if(command==='' && source[i]==='%'){i++;return node('mo','%');}
      if(!Object.hasOwn(symbols,command))throw Error('Unsupported math command');
      return node(['sum','min','max','in','le','ge','ne','approx','cdot','times','to','gets','infty','partial','nabla'].includes(command)?'mo':'mi',symbols[command]);
    }
    if(/[0-9.]/.test(c)){while(/[0-9.]/.test(source[i]||'')&&i<source.length)c+=source[i++];return node('mn',c);}
    if(/[a-zA-Zα-ωΑ-Ω]/.test(c))return node('mi',c);
    return node('mo',c==='-'?'−':c);
  }
  function row(end) {
    const result=node('mrow');
    while(i<source.length){skip();if(i>=source.length||source[i]===end)break;let base=atom(),sub,sup;skip();
      while(source[i]==='_'||source[i]==='^'){const kind=source[i++];const value=group();if(kind==='_'){if(sub)throw Error('Duplicate subscript');sub=value;}else{if(sup)throw Error('Duplicate superscript');sup=value;}skip();}
      if(sub||sup){const n=node(sub&&sup?'msubsup':sub?'msub':'msup');n.append(base);if(sub)n.append(sub);if(sup)n.append(sup);base=n;}
      result.append(base);
    }return result;
  }
  const math=node('math');math.setAttribute('display','block');math.append(row());if(i!==source.length)throw Error('Unparsed formula');return math;
}

function appendProse(parent,text) {
  const lines=text.trim().split('\n');
  const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
  const paragraph=[];
  function flush(){if(paragraph.length){const p=document.createElement('p');p.textContent=paragraph.join('\n');parent.append(p);paragraph.length=0;}}
  for(let i=0;i<lines.length;i++){
    const caption=lines[i].startsWith('表格：') ? lines[i].slice(3).trim() : '';
    const header=lines[i+1],divider=lines[i+2];
    if(caption&&header?.trim().startsWith('|')&&divider?.trim().startsWith('|')){
      const headings=cells(header),separators=cells(divider);
      const rows=[];let end=i+3;
      while(end<lines.length&&lines[end].trim().startsWith('|'))rows.push(cells(lines[end++]));
      if(headings.length>1&&separators.length===headings.length&&separators.every(c=>/^:?-{3,}:?$/.test(c))&&rows.length&&rows.every(row=>row.length===headings.length)){
        flush();
        const hint=document.createElement('p');hint.className='table-hint';hint.textContent='左右滑動表格，可查看完整欄位。';parent.append(hint);
        const wrapper=document.createElement('div');wrapper.className='table-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',caption+'，可左右捲動閱讀');
        const table=document.createElement('table');table.className='results-table';
        const title=document.createElement('caption');title.textContent=caption;table.append(title);
        const thead=document.createElement('thead'),tr=document.createElement('tr');
        headings.forEach(label=>{const th=document.createElement('th');th.setAttribute('scope','col');th.textContent=label;tr.append(th);});thead.append(tr);table.append(thead);
        const tbody=document.createElement('tbody');
        rows.forEach(row=>{const tr=document.createElement('tr');row.forEach((value,column)=>{const cell=document.createElement(column===0?'th':'td');if(column===0)cell.setAttribute('scope','row');cell.textContent=value;if(column>0&&/^[−-]?\d/.test(value))cell.className='numeric';tr.append(cell);});tbody.append(tr);});table.append(tbody);wrapper.append(table);parent.append(wrapper);
        i=end-1;continue;
      }
    }
    paragraph.push(lines[i]);
  }
  flush();
}

export function appendContent(parent,text) {
  // $$...$$ must occupy its own line. Plain prose retains its original wording.
  const parts=text.split(/\n?\$\$([\s\S]*?)\$\$\n?/g);
  parts.forEach((part,index)=>{
    if(!part.trim())return;
    if(index%2===0) appendProse(parent,part);
    else {
      const box=document.createElement('div');box.className='equation';box.tabIndex=0;box.setAttribute('role','region');box.setAttribute('aria-label','數學公式，可左右捲動閱讀');
      try {box.append(createMath(part.trim()));} catch {const fallback=document.createElement('code');fallback.textContent=part.trim();box.append(fallback);box.dataset.fallback='true';}
      parent.append(box);
    }
  });
}
