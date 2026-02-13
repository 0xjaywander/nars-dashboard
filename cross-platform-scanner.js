#!/usr/bin/env node
/**
 * Cross-Platform Prediction Market Arbitrage Scanner
 * Scans Polymarket, Omen, and other platforms for crypto event inefficiencies
 */

const https = require('https');
const http = require('http');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ============ POLYMARKET ============
async function fetchPolymarket() {
  console.log('📊 Fetching Polymarket...');
  const html = await httpsGet('https://polymarket.com/predictions/crypto');
  
  const markets = [];
  const qPattern = /"question":"([^"]+)"/g;
  const pPattern = /"outcomePrices":\[([^\]]+)\]/g;
  const vPattern = /"volume":(\d+(?:\.\d+)?)/g;
  
  const questions = [];
  const prices = [];
  const volumes = [];
  
  let m;
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
  for (let i = 0; i < count; i++) {
    markets.push({
      platform: 'Polymarket',
      question: questions[i],
      prices: prices[i],
      yesPrice: prices[i][0],
      noPrice: prices[i][1] || (1 - prices[i][0]),
      volume: volumes[i],
      url: 'https://polymarket.com/market/' + questions[i].toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
  }
  
  console.log(`   Found ${markets.length} markets`);
  return markets;
}

// ============ OMEN (Decentralized) ============
async function fetchOmen() {
  console.log('📊 Fetching Omen...');
  try {
    // Omen's subgraph endpoint (requires API key but let's try public)
    const query = JSON.stringify({
      query: `{
        fixedProductMarketMakers(first: 50, where: {category_contains: "crypto"}) {
          id
          title
          outcomeTokenPrices
          collateralVolume
          creationTimestamp
        }
      }`
    });
    
    const data = await httpsPost('https://api.thegraph.com/subgraphs/name/omeneth/omen-xdai', query);
    const result = JSON.parse(data);
    
    if (result.data?.fixedProductMarketMakers) {
      return result.data.fixedProductMarketMakers.map(m => ({
        platform: 'Omen',
        question: m.title,
        prices: m.outcomeTokenPrices || [],
        yesPrice: parseFloat(m.outcomeTokenPrices?.[0] || 0),
        noPrice: parseFloat(m.outcomeTokenPrices?.[1] || 0),
        volume: parseFloat(m.collateralVolume || 0),
        url: 'https://omen.eth.link/market/' + m.id
      }));
    }
  } catch (e) {
    console.log(`   Omen fetch failed: ${e.message.slice(0, 50)}`);
  }
  return [];
}

async function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ AUGUR ============
async function fetchAugur() {
  console.log('📊 Fetching Augur...');
  try {
    // Augur V2 markets
    const data = await httpsGet('https://api.augur.net/v2/markets');
    const markets = JSON.parse(data);
    
    return markets
      .filter(m => m.categories?.includes('crypto') || m.description?.toLowerCase().includes('crypto'))
      .map(m => ({
        platform: 'Augur',
        question: m.description || m.name,
        prices: [m.outcomes?.[0]?.price || 0.5, m.outcomes?.[1]?.price || 0.5],
        yesPrice: m.outcomes?.[0]?.price || 0.5,
        noPrice: m.outcomes?.[1]?.price || 0.5,
        volume: m.volume || 0,
        url: 'https://augur.net/market/' + m.id
      }));
  } catch (e) {
    console.log(`   Augur fetch failed`);
  }
  return [];
}

// ============ CROSS-PLATFORM ARBITRAGE DETECTION ============
function detectArbitrage(polymarketMarkets, omenMarkets, augurMarkets) {
  const opportunities = [];
  const allMarkets = [...polymarketMarkets, ...omenMarkets, ...augurMarkets];
  
  // Group by normalized event keywords
  const events = {};
  
  allMarkets.forEach(m => {
    // Extract key terms for matching
    const keywords = extractKeywords(m.question);
    const key = keywords.join('|');
    
    if (!events[key]) events[key] = [];
    events[key].push(m);
  });
  
  // Find cross-platform price differences
  Object.entries(events).forEach(([key, markets]) => {
    if (markets.length < 2) return;
    
    // Compare all pairs
    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const a = markets[i];
        const b = markets[j];
        
        if (a.platform === b.platform) continue;
        
        // Check if prices differ significantly
        const priceDiff = Math.abs(a.yesPrice - b.yesPrice);
        
        if (priceDiff > 0.05) { // >5% difference
          opportunities.push({
            event: a.question,
            platform1: a.platform,
            price1: a.yesPrice,
            platform2: b.platform,
            price2: b.yesPrice,
            difference: (priceDiff * 100).toFixed(1) + '%',
            direction: a.yesPrice > b.yesPrice 
              ? `Buy ${b.platform} / Sell ${a.platform}`
              : `Buy ${a.platform} / Sell ${b.platform}`,
            volume: Math.max(a.volume, b.volume)
          });
        }
      }
    }
  });
  
  return opportunities.sort((a, b) => parseFloat(b.difference) - parseFloat(a.difference));
}

function extractKeywords(question) {
  const normalized = question.toLowerCase()
    .replace(/bitcoin|btc/gi, 'BTC')
    .replace(/ethereum|eth/gi, 'ETH')
    .replace(/solana|sol/gi, 'SOL')
    .replace(/[$,]/g, '')
    .replace(/\s+/g, ' ');
  
  // Extract price if present
  const priceMatch = normalized.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
  const price = priceMatch ? priceMatch[0] : '';
  
  // Extract direction
  const direction = /above|up|reach|higher/i.test(normalized) ? 'ABOVE' :
                    /below|down|dip|lower/i.test(normalized) ? 'BELOW' : '';
  
  // Extract timeframe
  const dateMatch = normalized.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i);
  const date = dateMatch ? dateMatch[0].toUpperCase() : '';
  
  return ['BTC', price, direction, date].filter(Boolean);
}

// ============ MAIN ============
async function main() {
  console.log('🔍 Cross-Platform Crypto Arbitrage Scanner\n');
  console.log('═'.repeat(50));
  
  // Fetch from all platforms
  const polymarket = await fetchPolymarket();
  const omen = await fetchOmen();
  const augur = await fetchAugur();
  
  console.log(`\nTotal markets fetched: ${polymarket.length + omen.length + augur.length}`);
  console.log(`   Polymarket: ${polymarket.length}`);
  console.log(`   Omen: ${omen.length}`);
  console.log(`   Augur: ${augur.length}`);
  
  // Detect arbitrage
  const opportunities = detectArbitrage(polymarket, omen, augur);
  
  console.log('\n' + '='.repeat(50));
  console.log('🚨 CROSS-PLATFORM ARBITRAGE OPPORTUNITIES');
  console.log('='.repeat(50));
  
  if (opportunities.length === 0) {
    console.log('\n✅ No significant cross-platform inefficiencies found.');
    console.log('Crypto markets appear aligned across platforms.\n');
  } else {
    console.log(`\nFound ${opportunities.length} opportunities:\n`);
    
    opportunities.slice(0, 10).forEach((opp, i) => {
      console.log(`${i+1}. ${opp.event.slice(0, 60)}...`);
      console.log(`   ${opp.platform1}: ${(opp.price1 * 100).toFixed(1)}% | ${opp.platform2}: ${(opp.price2 * 100).toFixed(1)}%`);
      console.log(`   Difference: ${opp.difference}`);
      console.log(`   Action: ${opp.direction}`);
      console.log('');
    });
  }
  
  // Output for cron
  process.stdout.write('\n=== RAW ===\n');
  process.stdout.write(JSON.stringify({
    polymarket: polymarket.length,
    omen: omen.length,
    augur: augur.length,
    opportunities: opportunities.length
  }));
}

main().catch(console.error);
