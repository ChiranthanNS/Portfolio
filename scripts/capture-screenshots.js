const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const liveProjects = [
  {
    slug: 'settleiq',
    url: 'https://chiranthanns.github.io/SettleIQ/'
  },
  {
    slug: 'ieee-cis-vvce',
    url: 'https://ieee-cis-vvce.vercel.app/'
  },
  {
    slug: 'digital-complaint-management',
    url: 'https://ChiranthanNS.github.io/Digital_Complaint_Management_System/'
  },
  {
    slug: 'vvce-campus',
    url: 'https://chiranthanns.github.io/vvce/'
  }
];

async function capture() {
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'projects');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  for (const proj of liveProjects) {
    try {
      console.log(`Navigating to ${proj.slug} (${proj.url})...`);
      await page.goto(proj.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Give 2 seconds for any animations / web fonts to settle
      await new Promise(r => setTimeout(r, 2000));
      
      const filePath = path.join(outputDir, `${proj.slug}.png`);
      await page.screenshot({ path: filePath, type: 'png' });
      console.log(`Saved screenshot to ${filePath}`);
    } catch (err) {
      console.error(`Error capturing ${proj.slug}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done capturing live sites.');
}

capture().catch(console.error);
