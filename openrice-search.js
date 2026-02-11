const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🍜 Searching OpenRice for Chinese restaurants in Central, HK...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  try {
    // Navigate to OpenRice Central HK Chinese restaurants
    console.log('🌐 Navigating to openrice.com...');
    await page.goto('https://www.openrice.com/en/hong-kong/restaurants/central-chinese', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log('📄 Page loaded, extracting restaurants...');
    
    // Extract restaurant info
    const restaurants = await page.$$eval('.restaurantName', elements => {
      return elements.slice(0, 15).map(el => {
        const name = el.innerText.trim();
        const link = el.href || '';
        return { name, link };
      });
    }).catch(() => []);

    console.log(`Found ${restaurants.length} restaurants`);

    // Get more details if possible
    let output = '🍜 **Top Chinese Restaurants - Central, Hong Kong**\n\n';
    
    if (restaurants.length > 0) {
      restaurants.forEach((r, i) => {
        output += `${i+1}. ${r.name}\n`;
      });
      output += `\n[View all on OpenRice](https://www.openrice.com/en/hong-kong/restaurants/central-chinese)`;
    } else {
      // Try alternative selectors
      const altRestaurants = await page.$$eval('a', elements => {
        return elements.filter(el => el.innerText.includes('Restaurant') || el.innerText.includes('Chinese'))
          .slice(0, 10)
          .map(el => ({ name: el.innerText.trim(), link: el.href }));
      }).catch(() => []);
      
      if (altRestaurants.length > 0) {
        altRestaurants.forEach((r, i) => {
          output += `${i+1}. ${r.name}\n`;
        });
      } else {
        output = 'Could not extract restaurant list. OpenRice may have anti-bot protection.';
      }
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
