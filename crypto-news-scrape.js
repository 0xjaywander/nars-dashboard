const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🕷️ Starting Crypto News Scrape...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--ignore-certificate-errors'
    ]
  });

  const page = await browser.newPage();
  
  const sources = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/', selector: 'h2, h3' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/', selector: 'a.post-card__title' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/', selector: '.cs-post-card h3' },
    { name: 'Decrypt', url: 'https://decrypt.co/', selector: 'h2' },
    { name: 'The Block', url: 'https://www.theblock.co/', selector: 'h3' }
  ];

  const results = [];

  for (const source of sources) {
    try {
      console.log(`📰 Scraping ${source.name}...`);
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const headlines = await page.$$eval(source.selector, elements => {
        return elements.slice(0, 5)
          .map(el => el.innerText.trim())
          .filter(text => text.length > 10 && text.length < 200);
      }).catch(() => []);

      results.push({ source: source.name, url: source.url, headlines });
      console.log(`   Found ${headlines.length} headlines`);
    } catch (err) {
      console.log(`   Error: ${err.message}`);
      results.push({ source: source.name, error: err.message });
    }
  }

  await browser.close();

  // Format summary for Telegram
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let summary = `📊 *Crypto News Summary - ${date}*\n\n`;

  for (const r of results) {
    if (r.headlines && r.headlines.length > 0) {
      summary += `🔹 *${r.source}*\n`;
      r.headlines.slice(0, 5).forEach(h => {
        summary += `• ${h.substring(0, 100)}${h.length > 100 ? '...' : ''}\n`;
      });
      summary += '\n';
    }
  }

  summary += `_Scrape time: ${new Date().toISOString()}_`;

  const markdown = `# Crypto News - ${date}

${results.map(r => {
  if (r.headlines && r.headlines.length > 0) {
    return `## ${r.source}
${r.headlines.slice(0, 5).map(h => `- ${h}`).join('\n')}`;
  }
  return `## ${r.source}: Error fetching`;
}).join('\n\n')}

---
Generated: ${new Date().toISOString()}
`;

  // Save files
  fs.writeFileSync('/home/nars/.openclaw/workspace/crypto-news.md', markdown);
  fs.writeFileSync('/home/nars/.openclaw/workspace/crypto-news-telegram.md', summary);
  
  console.log('✅ Summary saved');
  console.log(summary);
})();
