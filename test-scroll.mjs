import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 400 } // Very small height to force scrolling
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:13333/login');
    await page.waitForLoadState('networkidle');

    console.log('Logging in...');
    await page.fill('input[type="email"]', 'vansonhk@gmail.com');
    await page.fill('input[type="password"]', '123123asd=');

    // Click and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    console.log('Current URL:', page.url());
    await page.waitForLoadState('networkidle');

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    console.log('Screenshot saved as after-login.png');

    // Try navigating to dashboard directly if not there
    if (!page.url().includes('dashboard')) {
      console.log('Navigating to dashboard directly...');
      await page.goto('http://localhost:13333/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Wait for calendar to load
    console.log('Waiting for calendar to load...');
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Click on "Day" view button to switch to day view where time-content exists
    console.log('Switching to Day view...');
    await page.click('button:has-text("Day")');
    await page.waitForTimeout(1000);

    // Now wait for rbc-time-content
    await page.waitForSelector('.rbc-time-content', { timeout: 10000 });
    console.log('Calendar loaded in Week view. Checking scroll behavior...');

    // Check if main body has overflow and get container hierarchy
    const mainOverflow = await page.evaluate(() => {
      const main = document.querySelector('main');
      const mainDiv = main?.querySelector('div');
      const calendarShell = document.querySelector('.calendar-shell');
      const calendarContainer = calendarShell?.parentElement;

      return {
        main: window.getComputedStyle(main).overflow,
        mainDiv: mainDiv ? window.getComputedStyle(mainDiv).overflow : null,
        calendarContainer: calendarContainer ? {
          height: window.getComputedStyle(calendarContainer).height,
          maxHeight: window.getComputedStyle(calendarContainer).maxHeight,
          overflow: window.getComputedStyle(calendarContainer).overflow,
        } : null,
        calendarShell: calendarShell ? {
          height: window.getComputedStyle(calendarShell).height,
        } : null,
      };
    });

    console.log('Main overflow styles:', mainOverflow);

    // Check rbc-time-content overflow and scrollability
    const timeContentInfo = await page.evaluate(() => {
      const timeContent = document.querySelector('.rbc-time-content');
      if (!timeContent) return null;

      const style = window.getComputedStyle(timeContent);
      const scrollHeight = timeContent.scrollHeight;
      const clientHeight = timeContent.clientHeight;
      const isScrollable = scrollHeight > clientHeight;

      return {
        overflowY: style.overflowY,
        scrollHeight,
        clientHeight,
        isScrollable,
        canScroll: isScrollable && style.overflowY !== 'visible' && style.overflowY !== 'hidden'
      };
    });

    console.log('Time content info:', timeContentInfo);

    // Create some events by clicking on time slots to force content overflow
    if (timeContentInfo && !timeContentInfo.isScrollable) {
      console.log('\nContent does not currently overflow. Creating test events...');

      // Scroll the time-content to a specific time to make it visible
      await page.evaluate(() => {
        const timeContent = document.querySelector('.rbc-time-content');
        if (timeContent) {
          // Scroll to 8 AM area
          timeContent.scrollTop = 400;
        }
      });

      await page.waitForTimeout(500);

      // Get final scroll metrics
      const finalTimeContentInfo = await page.evaluate(() => {
        const timeContent = document.querySelector('.rbc-time-content');
        if (!timeContent) return null;

        const style = window.getComputedStyle(timeContent);
        const scrollHeight = timeContent.scrollHeight;
        const clientHeight = timeContent.clientHeight;
        const scrollTop = timeContent.scrollTop;
        const isScrollable = scrollHeight > clientHeight;

        return {
          overflowY: style.overflowY,
          scrollHeight,
          clientHeight,
          scrollTop,
          isScrollable,
          canScroll: isScrollable && style.overflowY !== 'visible' && style.overflowY !== 'hidden'
        };
      });

      console.log('\nFinal time content info after programmatic scroll:', finalTimeContentInfo);

      if (finalTimeContentInfo.scrollTop > 0) {
        console.log('✓ Successfully scrolled programmatically! Scroll position:', finalTimeContentInfo.scrollTop);
        console.log('✓ The .rbc-time-content element IS configured to scroll correctly!');
      }
    }

    if (timeContentInfo?.canScroll) {
      console.log('✓ Calendar time content is scrollable!');

      // Try scrolling
      await page.evaluate(() => {
        const timeContent = document.querySelector('.rbc-time-content');
        if (timeContent) {
          console.log('Scrolling to position 500px...');
          timeContent.scrollTop = 500;
        }
      });

      await page.waitForTimeout(1000);

      const scrollPosition = await page.evaluate(() => {
        const timeContent = document.querySelector('.rbc-time-content');
        return timeContent?.scrollTop || 0;
      });

      console.log('Scroll position after scroll:', scrollPosition);

      if (scrollPosition > 0) {
        console.log('✓ Scrolling works correctly!');
      } else {
        console.log('✗ Scrolling did not work - scroll position is still 0');
      }
    } else {
      console.log('✗ Calendar time content is NOT scrollable');
      console.log('Reason:', timeContentInfo?.isScrollable ? 'overflow-y not set to auto/scroll' : 'content does not overflow');
    }

    // Try mouse wheel scrolling
    console.log('\nTesting mouse wheel scrolling...');
    const timeContentEl = await page.$('.rbc-time-content');
    if (timeContentEl) {
      const box = await timeContentEl.boundingBox();
      console.log('Time content bounding box:', box);

      // Scroll with mouse wheel
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);

      const scrollAfterWheel = await page.evaluate(() => {
        const timeContent = document.querySelector('.rbc-time-content');
        return timeContent?.scrollTop || 0;
      });

      console.log('Scroll position after mouse wheel:', scrollAfterWheel);
      if (scrollAfterWheel > 0) {
        console.log('✓ Mouse wheel scrolling WORKS!');
      }
    }

    // Keep browser open for 10 seconds so you can manually test
    console.log('\nKeeping browser open for 10 seconds for manual testing...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during test:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('Test complete.');
  }
})();
