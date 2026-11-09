import {categories,loadPapers,element,statusBadge,matchesPaper,loadError} from './data.js';
const grid = document.querySelector('#papers');
const status = document.querySelector('#results-status');
const search = document.querySelector('#search');
const category = document.querySelector('#category');
const form = document.querySelector('.filters');
form.addEventListener('submit', event => event.preventDefault());
function card(p) {
  const article = element('article',undefined,'paper-card');
  const top = element('div',undefined,'card-top');
  top.append(element('span',categories[p.category],'category-label'),element('span',String(p.year)));
  const href = `paper.html?slug=${encodeURIComponent(p.slug)}`;
  const heading = element('h3');
  const title = element('a',p.title); title.href = href; heading.append(title);
  const tags = element('div',undefined,'tags');
  tags.append(...p.tags.map(tag => element('span',tag,'tag')));
  const bottom = element('div',undefined,'card-bottom');
  const link = element('a','閱讀筆記 →','text-link'); link.href = href;
  link.setAttribute('aria-label',`閱讀筆記：${p.title}`);
  bottom.append(statusBadge(p.status),link);
  article.append(top,heading,element('p',p.authors.join(' · '),'authors'),element('p',p.summary,'summary'),tags,bottom);
  return article;
}
try {
  const papers = await loadPapers();
  document.querySelector('#total').textContent = `${papers.length} 篇筆記 · ${new Set(papers.map(p => p.category)).size} 個研究分類`;
  function render() {
    const filtered = papers.filter(p => matchesPaper(p,search.value,category.value));
    grid.replaceChildren(...filtered.map(card));
    status.textContent = `顯示 ${filtered.length} / ${papers.length} 篇論文`;
    if (!filtered.length) grid.append(element('p','沒有符合條件的論文。試試其他關鍵字，或按「重設」查看所有筆記。','empty'));
  }
  search.addEventListener('input',render);
  category.addEventListener('change',render);
  form.addEventListener('reset',() => {search.value='';category.value='';render();});
  render();
} catch {
  status.textContent = loadError; status.classList.add('notice');
  document.querySelector('#total').textContent = '資料載入失敗';
}
