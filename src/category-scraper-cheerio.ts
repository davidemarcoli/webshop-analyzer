import {Element} from "cheerio";

import {getRandomUserAgent} from "./utils/user-agent";
const unirest = require("unirest");
const cheerio = require("cheerio");

const baseUrl = `https://www.digitec.ch/`;
const language = `en`

try {
    const response = await unirest.get(baseUrl + language);
    const $ = cheerio.load(response.body);
    const category_results: string[] = [];

    const elements = $("li.sc-e98b4af7-0.gzjvBe");
    // console.log(element.get())

    // elements.siblings().each((i: number, el: Element) => {
    //     console.log("jdfbdsjfbds")
    // })

    elements.each(async (i: number, el: Element) => {
        const link = $(el).find("a");

        const linkText = link.text();
        const linkAddress = link.attr("href")
        console.log(linkAddress)

        if (!linkAddress?.includes("s1")) {
            return
        }

        const response = await unirest.get(baseUrl + linkAddress);
        const $category = cheerio.load(response.body);

        const categoryButton = $category("button.sc-4ef0d092-1.sc-4ef0d092-2.fvCfDS.MxYlE")

    });
} catch (error) {
    console.error("Error fetching categories:", error);
}