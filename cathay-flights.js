const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('✈️ Searching for CX flights HKG → TPE tomorrow...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--ignore-certificate-errors',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    // Try the direct booking URL
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0].replace(/-/g, '');
    
    console.log(`🌐 Searching for flights on ${tomorrow.toDateString()}...`);
    
    // Try different approaches
    const urls = [
      `https://www.cathaypacific.com/cx/en_HK/book-a-flight/results.html?itinerary=HKG-TPE-${dateStr}-1-0-0-Economy&adults=1&children=0&infants=0`,
    ];
    
    let success = false;
    
    for (const url of urls) {
      console.log(`Trying: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      const content = await page.content();
      
      if (content.includes('CX') || content.includes('Cathay') || content.includes('flight') || content.includes('HKG') || content.includes('TPE')) {
        console.log('Found relevant content!');
        
        // Extract any flight-like data
        const flights = content.match(/CX\s*\d{3,4}|HKG.*TPE|\d{2}:\d{2}|USD|EUR|HKD/gi) || [];
        console.log('Flight info found:', flights.slice(0, 20));
        
        fs.writeFileSync('/home/nars/.openclaw/workspace/flights.md', `# CX Flights HKG → TPE\n\nSearched: ${tomorrow.toDateString()}\n\nNote: Automated booking page access was blocked.\n\nPlease visit: https://www.cathaypacific.com\n\nFor tomorrow (${tomorrow.toDateString()}):\n- Select Hong Kong (HKG) → Taipei (TPE)\n- Check available CX flights`);
        
        success = true;
        break;
      }
    }
    
    if (!success) {
      console.log('Could not extract flight information');
      fs.writeFileSync('/home/nars/.openclaw/workspace/flights.md', `# CX Flights HKG → TPE\n\nCathay Pacific blocked automated access.\n\nPlease search manually at:\nhttps://www.cathaypacific.com`);
    }
    
    console.log('✅ Done!');
    
  } catch (err) {
    console.error('Error:', err.message);
    fs.writeFileSync('/home/nars/.openclaw/workspace/flights.md', `Error: ${err.message}`);
  }

  await browser.close();
})();
