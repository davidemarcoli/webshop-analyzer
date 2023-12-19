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
    console.log(textContent)
    return textContent as string
}

const fetchCategory = async (el: ElementHandle) => {
    const link = await el.$("a");
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

    // const response = await unirest.get(baseUrl + linkAddress);
    // const $category = cheerio.load(response.body);
    //
    // const categoryButton = $category("button.sc-4ef0d092-1.sc-4ef0d092-2.fvCfDS.MxYlE")

    // const page = await browser.newPage();
    // await page.setUserAgent(userAgent.toString());

    await page.setUserAgent(userAgent.random().toString());
    await page.goto(linkAddress);
    //console.log("Navigating")
    const categoryButton = await page.waitForSelector("button.sc-4ef0d092-1.sc-4ef0d092-2.fvCfDS.MxYlE")
    // const categoryButton = await page.$("#productListingContainer > div:nth-child(3) > div > div > div.sc-323b3b06-0.HnQNk > div:nth-child(1) > button")
    if (!categoryButton) {
        console.error((await page.$$("button")).length);
        // (await page.$$("button")).forEach(async (e: ElementHandle) => {
        //     console.log(await e.getProperty("ariaLabel"))
        // })
        return
    }
    //console.log("Clicking button")
    await categoryButton.click()


    const subCategories = await page.$$("label.sc-4afc59df-0.cStzil.sc-3798334f-0.eMqCTF")
    //console.log("Got " + subCategories.length + " subcategories")
    category.subCategories = await Promise.all(subCategories.map(async (subCategory: ElementHandle, i: number) => getSubCategoryName(subCategory)));
    return category
}

const baseUrl = `https://www.digitec.ch/`;
const language = `en`

const categories: Category[] = []

const userAgent = new UserAgent();
const browser = await puppeteer.launch({headless: "new"});
const page = await browser.newPage();
await page.setUserAgent(userAgent.random().toString());

await page.goto(baseUrl + language, { waitUntil: 'networkidle0' });

try {
    let elements = await page.$$("li.sc-e98b4af7-0.gzjvBe")
    // elements = [elements[0]]

    // const categories = await Promise.all(elements.map(async (el: ElementHandle, i: number) => fetchCategory(el)));

    const categories: (Category | undefined)[] = []
    elements.forEach(async (el: ElementHandle, i: number) => {
        categories.push(await fetchCategory(el))
    });
    const filteredCategories = categories.filter(value => value)

    //console.log(filteredCategories)
    fs.writeFile('categories.json', JSON.stringify(filteredCategories, null, 2), 'utf8', () => {});
} catch (error) {
    console.error("Error fetching categories:", error);
}