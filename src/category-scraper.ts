import fs from 'fs';
import { initializeBrowser } from './utils/puppeteerUtils';
import { fetchCategory, Category } from './utils/categoryUtils';
import { BASE_URL, LANGUAGE } from './utils/constants';

(async () => {
    try {
        const { browser, page } = await initializeBrowser();
        await page.goto(BASE_URL + LANGUAGE, { waitUntil: 'networkidle0' });
        let elements = await page.$$("li.sc-e98b4af7-0.gzjvBe");

        const categories: (Category | undefined)[] = []
        for (const el of elements) {
            categories.push(await fetchCategory(el, browser));
        }

        browser.close();

        const filteredCategories = categories.filter(Boolean);
        fs.writeFile('categories.json', JSON.stringify(filteredCategories, null, 2), 'utf8', () => {});
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
})();
