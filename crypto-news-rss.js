const Parser = require('rss-parser');
const fs = require('fs');

const parser = new Parser();

// Theme keywords for categorization
const themes = {
  'Bitcoin & BTC': ['bitcoin', 'btc', 'satoshi', 'halving', 'block reward'],
  'Ethereum & L2s': ['ethereum', 'eth', 'layer 2', 'l2', 'rollup', 'vitalik', 'erc-20'],
  'DeFi & Yield': ['defi', 'decentralized finance', 'yield', 'liquidity', 'amm', 'uniswap', 'aave', 'compound'],
  'Regulation': ['sec', 'cftc', 'regula', 'lawsuit', 'court', ' ruling', 'compliance', 'fca'],
  'Stablecoins & RWA': ['stablecoin', 'usdc', 'usdt', 'rwa', 'tokenized', 'treasury', 'money market'],
  'Market & Trading': ['market', 'price', 'trading', 'trader', 'liquidat', 'crash', 'surge', 'rally', 'bull', 'bear', 'outlook'],
  'Institutions & ETFs': ['etf', 'blackrock', 'fidelity', 'grayscale', 'institution', 'asset manager', 'fund'],
  'AI & Tech': ['ai ', 'artificial intelligence', 'grok', 'chatgpt', 'agI', 'automation'],
  'Altcoins & Memecoins': ['altcoin', 'meme', 'pepe', 'doge', 'shiba', 'solana', 'bnb', 'xrp']
};

(async () => {
  console.log('📰 Starting Themed Crypto News Scrape...');

  const rssFeeds = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed' },
    { name: 'CryptoPotato', url: 'https://cryptopotato.com/feed/' },
    { name: 'BeInCrypto', url: 'https://beincrypto.com/feed/' }
  ];

  const categorizedNews = {};
  for (const theme of Object.keys(themes)) {
    categorizedNews[theme] = [];
  }
  categorizedNews['Other'] = [];

  let sourcesCount = 0;

  // Fetch RSS feeds
  for (const feed of rssFeeds) {
    try {
      console.log(`📰 Fetching ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);
      sourcesCount++;
      
      for (const item of feedData.items.slice(0, 10)) {
        const title = item.title.toLowerCase();
        let categorized = false;
        
        for (const [theme, keywords] of Object.entries(themes)) {
          for (const keyword of keywords) {
            if (title.includes(keyword)) {
              categorizedNews[theme].push({ text: item.title, link: item.link, source: feed.name });
              categorized = true;
              break;
            }
          }
          if (categorized) break;
        }
        
        if (!categorized) {
          categorizedNews['Other'].push({ text: item.title, link: item.link, source: feed.name });
        }
      }
      console.log(`   Processed ${feedData.items.length} articles`);
    } catch (err) {
      console.log(`   Error: ${err.message}`);
    }
  }

  // Format for Telegram
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  let telegramMsg = `📊 *Crypto News — ${date}*\n\n`;
  let markdown = `# Crypto News — ${date}\n\n`;

  // Non-empty themes first
  for (const [theme, items] of Object.entries(categorizedNews)) {
    if (items.length > 0) {
      telegramMsg += `🔹 *${theme}*\n`;
      markdown += `## ${theme}\n`;
      
      items.slice(0, 5).forEach(item => {
        const text = item.text.length > 120 ? item.text.substring(0, 120) + '...' : item.text;
        telegramMsg += `• ${text} [${item.source}]\n`;
        markdown += `- ${text} ([${item.source}](${item.link}))\n`;
      });
      telegramMsg += '\n';
      markdown += '\n';
    }
  }

  telegramMsg += `_Generated: ${new Date().toISOString().split('T')[0]} | ${sourcesCount} sources_`;
  markdown += `---\nGenerated: ${new Date().toISOString()}`;

  // Save files
  fs.writeFileSync('/home/nars/.openclaw/workspace/crypto-news.md', markdown);
  fs.writeFileSync('/home/nars/.openclaw/workspace/crypto-news-telegram.md', telegramMsg);

  console.log('✅ Done!');
  console.log(telegramMsg);
})();
