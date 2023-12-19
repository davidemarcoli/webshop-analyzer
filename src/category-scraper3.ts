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

const fetchCategory = async (link: string, name: string) => {
    const category: Category = {
        name,
        link,
        subCategories: []
    }

    if (!link?.includes("s1")) {
        return
    }

    await page.setUserAgent(userAgent.random().toString());
    await page.goto(link);
    //console.log("Navigating")
    const categoryButton = await page.$("button.sc-4ef0d092-1.sc-4ef0d092-2.fvCfDS.MxYlE")
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


const userAgent = new UserAgent();
const browser = await puppeteer.launch({headless: "new"});
const page = await browser.newPage();

try {

    const category = await fetchCategory("https://www.digitec.ch/en/s1/tag/audio-591", "Audio")

    //console.log(filteredCategories)
    fs.writeFile('category.json', JSON.stringify(category, null, 2), 'utf8', () => {});
} catch (error) {
    console.error("Error fetching categories:", error);
}