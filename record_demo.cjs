const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Starting demo video recording...');
  const videosDir = path.join(__dirname, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Use installed Chrome executable
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videosDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  console.log('1. Navigating to Wayfare Landing Page...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Smooth scroll down to scenarios
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  // 2. Click on the first scenario (Tokyo Solo Explorer)
  console.log('2. Opening Tokyo Solo Scenario...');
  const launchButtons = page.locator('text=Launch This Itinerary');
  if (await launchButtons.count() > 0) {
    await launchButtons.first().click();
  } else {
    await page.goto('http://127.0.0.1:5173/trips/t-solo-tokyo-001', { waitUntil: 'networkidle' });
  }

  await page.waitForTimeout(2500);

  // 3. Switch to Day 2 Tab
  console.log('3. Inspecting Day 2 itinerary & Leaflet map pins...');
  const day2Tab = page.locator('text=Day 2');
  if (await day2Tab.count() > 0) {
    await day2Tab.click();
    await page.waitForTimeout(2000);
  }

  // Switch back to Day 1
  const day1Tab = page.locator('text=Day 1');
  if (await day1Tab.count() > 0) {
    await day1Tab.click();
    await page.waitForTimeout(1500);
  }

  // 4. Open Suggest 3 Alternatives
  console.log('4. Suggesting 3 AI Alternatives for a stop...');
  const sparklesButtons = page.locator('button[title*="alternatives"]');
  if (await sparklesButtons.count() > 0) {
    await sparklesButtons.first().click();
    await page.waitForTimeout(2500);

    // Click "Swap In" on the first alternative
    const swapButton = page.locator('button:has-text("Swap In")');
    if (await swapButton.count() > 0) {
      console.log('   -> Swapping alternative stop into itinerary...');
      await swapButton.first().click();
      await page.waitForTimeout(2000);
    }
  }

  // 5. Toggle Lock on an item
  console.log('5. Toggling Item Lock...');
  const lockButtons = page.locator('button[title*="Lock"]');
  if (await lockButtons.count() > 0) {
    await lockButtons.first().click();
    await page.waitForTimeout(1200);
  }

  // 6. Open Regenerate Day Modal
  console.log('6. Opening Regenerate Day Modal...');
  const regenButton = page.locator('button:has-text("Regenerate Day")');
  if (await regenButton.count() > 0) {
    await regenButton.click();
    await page.waitForTimeout(1500);

    // Type instructions
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Focus on scenic photography spots and quiet tea houses');
      await page.waitForTimeout(1000);
    }

    // Close or submit
    const closeBtn = page.locator('button:has-text("Cancel")');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 7. Open Share & Export Modal
  console.log('7. Opening Share & Export Modal...');
  const shareButton = page.locator('button:has-text("Share & Export")');
  if (await shareButton.count() > 0) {
    await shareButton.click();
    await page.waitForTimeout(2000);
    const closeBtn = page.locator('button:has-text("Cancel")');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // 8. Navigate to Trip Builder
  console.log('8. Demonstrating Multi-Step Trip Builder Wizard...');
  await page.goto('http://127.0.0.1:5173/builder', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Fill destination
  const destInput = page.locator('input[placeholder*="Tokyo"]');
  if (await destInput.count() > 0) {
    await destInput.fill('Kyoto, Japan');
    await page.waitForTimeout(800);
  }

  // Continue to step 2
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1200);

  // Select Couple dynamics
  const coupleBtn = page.locator('button:has-text("Couple Getaway")');
  if (await coupleBtn.count() > 0) {
    await coupleBtn.click();
    await page.waitForTimeout(1000);
  }

  // Continue to step 3 (Budget)
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1200);

  // Continue to step 4 (Interests)
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1200);

  // Continue to step 5 (Review)
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(2000);

  // 9. Go to Dashboard
  console.log('9. Touring Dashboard & Metric Cards...');
  await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Close page and context to finish video encoding
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded video file
  const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const videoPath = path.join(videosDir, videoFiles[0]);
    const finalVideoPath = path.join(videosDir, 'wayfare_demo_walkthrough.webm');
    fs.renameSync(videoPath, finalVideoPath);
    console.log(`\nSUCCESS: Demo video saved to ${finalVideoPath}`);
    return finalVideoPath;
  }
}

run().catch(err => {
  console.error('Error recording demo video:', err);
  process.exit(1);
});
