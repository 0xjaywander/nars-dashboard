#!/usr/bin/env node
/**
 * Polymarket Market Analyzer
 * Checks for various inefficiencies including:
 * - Type 1: Spread > 103% (guaranteed arb)
 * - Type 2: Conflicting Up/Down
 * - Type 3: Large spreads on high volume markets
 * - Type 4: Multi-outcome mispricing
 */

const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Polymarket Crypto Analysis\n');
  
  const html = await fetchPage('https://polymarket.com/predictions/crypto');
  
  // Parse data
  const questions = [];
  const prices = [];
  const volumes = [];
  
  let m;
  const qPattern = /"question":"([^"]+)"/g;
  const pPattern = /"outcomePrices":\[([^\]]+)\]/g;
  const vPattern = /"volume":(\d+(?:\.\d+)?)/g;
  
  while ((m = qPattern.exec(html)) !== null) {
    questions.push(JSON.parse('"' + m[1] + '"'));
  }
  while ((m = pPattern.exec(html)) !== null) {
    prices.push(m[1].split(',').map(p => parseFloat(p.replace(/"/g, ''))));
  }
  while ((m = vPattern.exec(html)) !== null) {
    volumes.push(parseFloat(m[1]));
  }
  
  const count = Math.min(questions.length, prices.length, volumes.length);
  const markets = [];
  
  for (let i = 0; i < count; i++) {
    markets.push({
      question: questions[i],
      prices: prices[i],
      volume: volumes[i],
      yesPrice: prices[i][0],
      noPrice: prices[i][1] || (1 - prices[i][0]),
      combined: prices[i][0] + (prices[i][1] || (1 - prices[i][0]))
    });
  }
  
  console.log(`Total markets: ${markets.length}\n`);
  
  // Show top markets by volume
  console.log('💰 TOP 10 BY VOLUME');
  console.log('─'.repeat(45));
  
  markets
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .forEach((m, i) => {
      const spread = Math.abs(m.combined - 1);
      console.log(`${i+1}. ${m.question.slice(0, 40)}...`);
      console.log(`   Vol: $${(m.volume/1000).toFixed(0)}K | Yes: ${(m.yesPrice*100).toFixed(1)}% | No: ${(m.noPrice*100).toFixed(1)}%`);
      console.log(`   Combined: ${(m.combined*100).toFixed(2)}% | Spread: ${(spread*100).toFixed(2)}%\n`);
    });
  
  // Check specific inefficiencies
  console.log('\n📊 INEFFICIENCY CHECK');
  console.log('─'.repeat(45));
  
  // 1. Spread > 3%
  const spreadIssues = markets.filter(m => Math.abs(m.combined - 1) > 0.03 && m.volume > 10000);
  console.log(`Spread > 3% (Vol > $10K): ${spreadIssues.length}`);
  
  // 2. Conflicting Up/Down
  const grouped = {};
  markets.forEach(m => {
    const key = m.question.match(/(BTC|ETH|SOL|XRP)/i)?.[0] || 'OTHER';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  
  let conflicts = 0;
  Object.entries(grouped).forEach(([asset, mkts]) => {
    const up = mkts.filter(m => /up|above/i.test(m.question));
    const down = mkts.filter(m => /down|below/i.test(m.question));
    up.forEach(u => {
      down.forEach(d => {
        if (u.yesPrice + d.yesPrice > 1.03) conflicts++;
      });
    });
  });
  console.log(`Conflicting Up/Down pairs: ${conflicts}`);
  
  // 3. Multi-outcome price markets (the interesting ones)
  console.log('\n🎯 MULTI-OUTCOME PRICE MARKETS (Inefficiency Candidates)');
  console.log('─'.repeat(45));
  
  const multiOutcome = markets.filter(m => m.prices.length > 2);
  console.log(`Found ${multiOutcome.length} multi-outcome markets\n`);
  
  if (multiOutcome.length > 0) {
    multiOutcome.slice(0, 5).forEach((m, i) => {
      const total = m.prices.reduce((a, b) => a + b, 0);
      console.log(`${i+1}. ${m.question.slice(0, 50)}...`);
      console.log(`   Prices: ${m.prices.map(p => (p*100).toFixed(1)+'%').join(' | ')}`);
      console.log(`   Sum: ${(total*100).toFixed(2)}% | Vol: $${(m.volume/1000).toFixed(0)}K\n`);
      
      if (total > 1.03) {
        console.log(`   🚨 ARBITRAGE: Combined odds > 100%\n`);
      }
    });
  }
  
  // Check combined probability across related markets
  console.log('\n📈 MARKET SENTIMENT SUMMARY');
  console.log('─'.repeat(45));
  
  const sentiment = {
    BTC: { bullish: 0, bearish: 0, vol: 0 },
    ETH: { bullish: 0, bearish: 0, vol: 0 },
    SOL: { bullish: 0, bearish: 0, vol: 0 },
  };
  
  markets.forEach(m => {
    const asset = m.question.match(/(BTC|ETH|SOL|XRP)/i)?.[0]?.toUpperCase() || 'OTHER';
    if (sentiment[asset]) {
      if (/up|above|reach/i.test(m.question)) {
        sentiment[asset].bullish += m.yesPrice * m.volume;
      } else if (/down|below|dip/i.test(m.question)) {
        sentiment[asset].bearish += m.yesPrice * m.volume;
      }
      sentiment[asset].vol += m.volume;
    }
  });
  
  Object.entries(sentiment).forEach(([asset, s]) => {
    if (s.vol > 0) {
      const bullPct = (s.bullish / s.vol * 100).toFixed(1);
      const bearPct = (s.bearish / s.vol * 100).toFixed(1);
      console.log(`${asset}: Bull ${bullPct}% | Bear ${bearPct}% | Vol: $${(s.vol/1000).toFixed(0)}K`);
    }
  });
}

main().catch(console.error);
