import {appendContent} from './math.js';
import {categories,loadPapers,element,statusBadge,safeUrl,loadError} from './data.js';
const status = document.querySelector('#load-status');
const article = document.querySelector('#paper');
const sections = [['metadata','基本資訊','Metadata'],['summary','摘要','Summary'],['motivation','研究背景','Motivation'],['method','核心方法','Method'],['experiments','實驗設計與研究結果','Experiments'],['limitations','優點與限制','Limitations'],['takeaways','個人筆記','Takeaways'],['sources','參考來源','Sources']];
function sourceLink(text,url) {
  const link = element('a',text); link.href = safeUrl(url); return link;
}
try {
  const slug = new URLSearchParams(location.search).get('slug');
  const papers = await loadPapers();
  const p = papers.find(paper => paper.slug === slug);
  if (!p) {
    document.title = '找不到論文｜PaperNotes';
    status.textContent = '找不到這篇論文。網址可能不完整，請使用上方連結返回首頁，重新選擇論文。';
    status.classList.add('notice');
  } else {
    document.title = `${p.title}｜PaperNotes`;
    const header = element('header',undefined,'paper-heading');
    header.append(element('p',`${categories[p.category]} / ${p.year}`,'eyebrow'),element('h1',p.title),element('p',p.authors.join(' · '),'authors'),statusBadge(p.status));
    if (p.status === 'draft') header.append(element('p','草稿說明：已核對的資訊與待查證內容分別註記於各節。草稿不代表已完成全文審核或實驗重現。','notice'));
    const nav = element('nav',undefined,'detail-nav');nav.setAttribute('aria-label','筆記章節');
    article.append(header,nav);
    for (const [key,label,en] of sections) {
      const anchor = element('a',label);anchor.href=`#${key}`;nav.append(anchor);
      const section = element('section',undefined,'content-section');section.id=key;
      const h2 = element('h2',label);h2.id=`${key}-title`;section.setAttribute('aria-labelledby',h2.id);
      section.append(element('p',en.toUpperCase(),'eyebrow'),h2);
      if (key === 'metadata') {
        const dl = element('dl');
        for (const [name,value] of [['作者',p.authors.join('、')],['年份',String(p.year)],['發表場域',p.venue === 'Unverified' ? '尚未查證' : p.venue],['研究分類',`${categories[p.category]} / ${p.category}`],['標籤',p.tags.join('、') || '無'],['查證狀態',p.status === 'verified' ? '已查證' : '草稿'],['DOI',p.doi || '尚未確認／未填寫']]) {
          const dd = element('dd');dd.append(name === 'DOI' && p.doi ? sourceLink(p.doi,p.doi) : document.createTextNode(value));dl.append(element('dt',name),dd);
        }
        section.append(dl);
      } else if (key === 'sources') {
        const list = element('ul',undefined,'source-list');
        const seenUrls = new Set();
        for (const [label,url] of [['出版識別碼（DOI）',p.doi],['原始論文／官方專案頁',p.url]]) {
          const href = safeUrl(url);
          if (!href || seenUrls.has(href)) continue;
          seenUrls.add(href);
          const li=element('li');li.append(sourceLink(label,href));list.append(li);
        }
        section.append(list.childNodes.length ? list : element('p','尚無已查證的公開來源。'));
        section.append(element('p','本站以原創文字整理閱讀理解，不提供論文全文。個人筆記與延伸問題不等同於原文結論。','muted'));
      } else {
        const seenHeadings = new Set();
        const seenParagraphs = new Set();
        for (const paragraph of p[key].split('\n\n')) {
          if (seenParagraphs.has(paragraph.trim())) continue;
          seenParagraphs.add(paragraph.trim());
          const match = paragraph.match(/^(實驗設計|研究結果|優點|限制|研究問題|既有方法不足|演算法流程|重要公式|DMA 更新公式|設定與界線|迭代與收斂|比較方法|比較設定與評估指標|比較設定與指標|比較解讀|結果解讀|研究貢獻|作者原述限制|AI 補充分析|待查證|閱讀筆記|查證範圍|評估公式|足部位置演算法|模型特徵)：\n([\s\S]*)$/);
          if (match) {
            if (!seenHeadings.has(match[1])) section.append(element('h3',match[1]));
            seenHeadings.add(match[1]);
            appendContent(section,match[2]);
          } else appendContent(section,paragraph);
        }
      }
      article.append(section);
    }
    status.hidden = true;article.hidden = false;
  }
} catch {status.textContent=loadError;status.classList.add('notice');}
