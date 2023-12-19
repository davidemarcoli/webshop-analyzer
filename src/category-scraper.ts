var fs = require('fs');

import {ElementHandle} from "puppeteer";
import UserAgent from 'user-agents';

const puppeteer = require('puppeteer');

type Category = {
    name: string;
    link: string;
    subCategories: string[]
}

const getSubCategoryName = async (el: ElementHandle) => {
    const textElement = await el.$("span.sc-3798334f-1.iZdcQN")
    const textContent = await (await textElement!.getProperty('textContent')).jsonValue();
    return textContent as string
}

const fetchCategory = async (el: ElementHandle) => {
    const link = await el.waitForSelector("a");
    const linkText = await (await link!.getProperty('textContent')).jsonValue()
    const linkAddress = await (await link!.getProperty('href')).jsonValue()
    console.log(linkAddress)

    const category: Category = {
        name: linkText,
        link: linkAddress,
        subCategories: []
    }

    if (!linkAddress?.includes("s1")) {
        return
    }

    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(linkAddress);
    const categoryButton = await page.waitForSelector("button.sc-4ef0d092-1.sc-4ef0d092-2.fvCfDS.MxYlE")
    if (!categoryButton) {
        console.error("No category button found")
        return
    }
    await categoryButton.click()

    const subCategories = await page.$$("label.sc-4afc59df-0.cStzil.sc-3798334f-0.eMqCTF")
    //console.log("Got " + subCategories.length + " subcategories")
    category.subCategories = await Promise.all(subCategories.map(async (subCategory: ElementHandle, i: number) => getSubCategoryName(subCategory)));
    page.close();
    return category
}

const baseUrl = `https://www.digitec.ch/`;
const language = `en`

const categories: Category[] = []

const userAgent = new UserAgent();
const browser = await puppeteer.launch({headless: "new"});
const page = await browser.newPage();
await page.setUserAgent(userAgent.random().toString());

await page.goto(baseUrl + language, {waitUntil: 'networkidle0'});

try {
    // TODO: switch to getting a tag instead of li
    let elements = await page.$$("li.sc-e98b4af7-0.gzjvBe")

    const categories: (Category | undefined)[] = []
    for (const el of elements) {
        categories.push(await fetchCategory(el));
        // If a timeout is needed, uncomment the following line
        // await new Promise(r => setTimeout(r, 1000));
    }

    browser.close();

    const filteredCategories = categories.filter(value => value)

    fs.writeFile('categories.json', JSON.stringify(filteredCategories, null, 2), 'utf8', () => {
    });
} catch (error) {
    console.error("Error fetching categories:", error);
}