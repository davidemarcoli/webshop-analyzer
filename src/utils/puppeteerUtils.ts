import puppeteer from 'puppeteer';
import UserAgent from 'user-agents';

export const initializeBrowser = async () => {
    const userAgent = new UserAgent();
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    return { browser, page };
}
