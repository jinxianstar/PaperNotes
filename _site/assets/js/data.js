export const categories = {'Image Processing':'影像處理','Networking':'網路通訊','AI & ML':'人工智慧與機器學習','Other':'其他'};
const textFields = ['slug','title','venue','doi','url','summary','motivation','method','experiments','limitations','takeaways'];
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function validatePapers(papers) {
  if (!Array.isArray(papers)) throw new Error('論文資料必須為陣列');
  const slugs = new Set();
  for (const p of papers) {
    if (!p || textFields.some(key => typeof p[key] !== 'string') ||
      textFields.filter(key => !['doi','url'].includes(key)).some(key => !p[key].trim()) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug) ||
      !Number.isInteger(p.year) || !Object.hasOwn(categories,p.category) ||
      !['draft','verified'].includes(p.status) ||
      ['authors','tags'].some(key => !Array.isArray(p[key]) || p[key].some(v => typeof v !== 'string' || !v.trim())) ||
      p.authors.length === 0 || (p.url && !safeUrl(p.url)) ||
      (p.doi && !/^https:\/\/doi\.org\/10\.\S+$/.test(p.doi))) throw new Error('論文資料格式錯誤');
    slugs.add(p.slug);
  }
  return papers;
}
export async function loadPapers() {
  const response = await fetch('data/papers.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return validatePapers(await response.json());
}
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function statusBadge(status) {return element('span',status === 'verified' ? '已查證' : '草稿・待補查證',`badge ${status}`);}
export function matchesPaper(paper, query, category) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = [paper.title,...paper.authors,paper.year,paper.venue,paper.category,categories[paper.category],...paper.tags,paper.summary,paper.motivation,paper.method,paper.experiments,paper.limitations,paper.takeaways].join(' ').toLocaleLowerCase();
  return (!category || category === paper.category) && words.every(word => text.includes(word));
}
export const loadError = '無法載入論文資料。請確認網路連線，並透過 HTTP 伺服器開啟網站；也請檢查 data/papers.json 的位置與格式，再重新整理。';
