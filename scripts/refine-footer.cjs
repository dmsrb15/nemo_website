const fs = require('fs'), path = require('path');
const dist = path.resolve(__dirname, '../dist');
const menu = `<nav class="footer-directory" aria-label="하단 메뉴"><div class="footer-link-group"><h2>공간 서비스</h2><a href="residential.html">주거 공간</a><a href="commercial.html">상업 공간</a><a href="office.html">사무 공간</a><a href="popup.html">팝업 공간</a></div><div class="footer-link-group"><h2>디자인 서비스</h2><a href="branding.html">브랜딩</a><a href="styling.html">스타일링</a></div><div class="footer-link-group"><h2>네모</h2><a href="portfolios.html">포트폴리오</a><a href="about.html">회사소개</a><a href="newsroom.html">뉴스룸</a><button type="button" data-info="careers">채용</button></div></nav>`;
for (const file of fs.readdirSync(dist).filter(file => file.endsWith('.html'))) {
 const target = path.join(dist, file), html = fs.readFileSync(target, 'utf8');
 fs.writeFileSync(target, html.replace(/<footer\b[\s\S]*?<\/footer>/g, footer => footer.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/, menu)));
}
