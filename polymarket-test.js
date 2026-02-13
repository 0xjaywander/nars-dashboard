#!/usr/bin/env node
/**
 * Polymarket Arbitrage Scanner
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
  const html = await fetchPage('https://polymarket.com/predictions/crypto');
  
  // Extract all outcomePrices arrays
  const priceRegex = /"outcomePrices":\[([^\]]+)\]/g;
  const volumeRegex = /"volume":(\d+(?:\.\d+)?)/g;
  const questionRegex = /"question":"([^"]+)"/g;
  
  const prices = [];
  const volumes = [];
  const questions = [];
  
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    prices.push(match[1].split(',').map(p => parseFloat(p.replace(/"/g, ''))));
  }
  
  // Get volumes
  const volMatches = html.match(/"volume":(\d+(?:\.\d+)?)/g);
  if (volMatches) {
    volMatches.slice(0, 50).forEach(v => {
      volumes.push(parseFloat(v.replace(/"/g, '').replace('volume:', '')));
    });
  }
  
  // Get questions
  const qMatches = html.match(/"question":"([^"]+)"/g);
  if (qMatches) {
    qMatches.slice(0, 50).forEach(q => {
      questions.push(JSON.parse('"' + q.replace('"question":"', '').replace('"', '') + '"'));
    });
  }
  
  console.log(`Prices arrays: ${prices.length}`);
  console.log(`Volumes: ${volumes.length}`);
  console.log(`Questions: ${questions.length}`);
  
  // Show sample data
  console.log('\n--- Sample Markets ---');
  for (let i = 0; i < Math.min(5, prices.length, questions.length); i++) {
    console.log(`Q: ${questions[i].slice(0, 60)}...`);
    console.log(`Prices: [${prices[i].map(p => (p * 100).toFixed(1) + '%').join(', ')}]`);
    console.log(`Volume: $${(volumes[i] / 1000).toFixed(0)}K\n`);
  }
}

main().catch(console.error);
