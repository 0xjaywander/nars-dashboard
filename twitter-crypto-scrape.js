const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🕷️ Starting Twitter crypto scrape...');
  
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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  // Scrape crypto trending topics from multiple sources
  const sources = [
    { name: 'Twitter Crypto Trending', url: 'https://twitter.com/hashtag/cryptocurrency?src=hash' },
    { name: 'Bitcoin', url: 'https://twitter.com/hashtag/bitcoin?src=hash' },
    { name: 'DeFi', url: 'https://twitter.com/hashtag/defi?src=hash' }
  ];

  const results = [];

  for (const source of sources) {
    try {
      console.log(`📰 Scraping ${source.name}...`);
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract tweet text snippets
      const tweets = await page.$$eval('article', articles => {
        return articles.slice(0, 5).map(article => {
          const text = article.innerText;
          return text.length > 100 ? text.substring(0, 100) + '...' : text;
        });
      }).catch(() => []);

      results.push({ source: source.name, tweets });
      console.log(`   Found ${tweets.length} tweets`);
    } catch (err) {
      console.log(`   Error: ${err.message}`);
      results.push({ source: source.name, error: err.message });
    }
  }

  await browser.close();

  // Format summary
  const summary = `# Crypto News Summary - ${new Date().toLocaleDateString()}

## Sources Scraped
${results.map(r => `### ${r.source}`)
  .join('\n')}

## Key Trends
${results.map(r => {
  if (r.tweets && r.tweets.length > 0) {
    return `- ${r.source}: ${r.tweets.length} posts found`;
  }
  return `- ${r.source}: Unable to fetch`;
}).join('\n')}

## Notes
- Automated scrape via OpenClaw
- Time: ${new Date().toISOString()}
`;

  // Save to file
  fs.writeFileSync('/home/nars/.openclaw/workspace/crypto-news.md', summary);
  console.log('✅ Summary saved to crypto-news.md');
  console.log(summary);
})();
