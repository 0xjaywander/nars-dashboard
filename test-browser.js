const puppeteer = require('puppeteer-core');

(async () => {
  console.log('Starting browser test...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--js-flags=--no-irrigious',
      '--ignore-certificate-errors'
    ]
  });

  console.log('Browser launched successfully!');
  
  const page = await browser.newPage();
  console.log('Page created');
  
  // Test with a simple page
  await page.goto('https://example.com');
  console.log('Page loaded:', await page.title());
  
  await browser.close();
  console.log('Browser test PASSED');
})();
