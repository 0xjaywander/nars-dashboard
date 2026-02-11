const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🍜 Searching for Chinese restaurants in Central, HK...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15');
  
  try {
    // Try Google Maps via a different approach
    console.log('🌐 Trying Google Maps search...');
    await page.goto('https://www.google.com/search?q=best+chinese+restaurants+central+hong+kong', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log('📄 Extracting results...');
    
    const results = await page.$$eval('.CCgQb', elements => {
      return elements.slice(0, 10).map(el => el.innerText.trim());
    }).catch(() => []);

    console.log(`Found ${results.length} results`);
    
    let output = '🍜 **Best Chinese Restaurants - Central, Hong Kong**\n\n';
    
    if (results.length > 0) {
      results.forEach((r, i) => {
        output += `${i+1}. ${r.substring(0, 200)}\n`;
      });
    } else {
      output = 'Could not extract listings. Google may have anti-bot protection.';
    }

    console.log('✅ Done!');
    console.log(output);
    fs.writeFileSync('/home/nars/.openclaw/workspace/restaurants.md', output);
    
  } catch (err) {
    console.error('Error:', err.message);
    fs.writeFileSync('/home/nars/.openclaw/workspace/restaurants.md', `Error: ${err.message}`);
  }

  await browser.close();
})();
