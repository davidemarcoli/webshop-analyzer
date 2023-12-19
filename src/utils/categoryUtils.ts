import {Browser, ElementHandle} from "puppeteer";
import UserAgent from 'user-agents';

export type Category = {
    name: string;
    link: string;
    subCategories: string[]
}

export const getSubCategoryName = async (el: ElementHandle): Promise<string> => {
    const textElement = await el.$("span.sc-3798334f-1.iZdcQN")
    const textContent = await (await textElement!.getProperty('textContent')).jsonValue();
    return textContent as string
}

export const fetchCategory = async (el: ElementHandle, browser: Browser): Promise<Category | undefined> => {
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
    await page.setUserAgent(new UserAgent().random().toString());
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
