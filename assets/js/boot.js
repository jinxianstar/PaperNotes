// Classic scripts also work when the page is opened directly from the filesystem.
(() => {
  const script = document.createElement('script');
  if (location.protocol === 'file:') {
    script.src = 'assets/js/offline.js';
  } else {
    script.type = 'module';
    script.src = document.querySelector('#paper') ? 'assets/js/paper.js' : 'assets/js/app.js';
  }
  script.onerror = () => {
    const status = document.querySelector('#load-status, #results-status');
    if (status) {
      status.textContent = '無法載入網站程式。請確認 assets 資料夾與 HTML 放在一起，再重新開啟。';
      status.classList.add('notice');
    }
  };
  document.head.append(script);
})();
