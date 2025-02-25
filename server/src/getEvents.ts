import axios from "axios";
import * as cheerio from "cheerio";
import { getDb } from "./config/database";
import { vectorStore } from "./config/vectorDb";

const fetchEvents = async () => {
  const events = [];
  const eventsTitle = [];
  const url = "https://www.sydney.com/events/march?page=";
  const numberOfPages = await getNumberOfPage(url + 0);
  const db = getDb();

  let i = 0;

  while (i < Number(numberOfPages)) {
    await fetchEventsByPage(url + i, events, eventsTitle);
    i++;
  }

  //stroing data into mongodb
  await db.collection("events").deleteMany({});
  await db.collection("events").insertMany(events);

  //stroing data into faiss
  await vectorStore.addDocuments(eventsTitle);
};

async function getNumberOfPage(url: string) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const numberOfPagesUrl = $('a[title="Go to last page"]').attr("href");
  const numberOfPages = new URLSearchParams(numberOfPagesUrl).get("page");
  return numberOfPages;
}

async function fetchEventsByPage(url: string, events: any, eventsTitle: any) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  $("ol.product-list-ol li").each((index, element) => {
    const $element = $(element);
    // Extract image URL from the source set
    const imgElement = $element.find("img[loading='lazy']");
    const imageUrl = imgElement.attr("data-src") || "";

    const discription =
      $element.find("div[itemprop=description]").text().trim() || "";

    // Extract title and URL
    const linkElement = $element.find('a[target="_blank"]');
    const eventUrl = linkElement.attr("href") || "";

    const titleElement = $element.find('h3[itemprop="name"]');
    const title = $(titleElement).find("span").text();

    // Extract dates
    const startDate =
      $element.find('meta[itemprop="startDate"]').attr("content") || "";
    const endDate =
      $element.find('meta[itemprop="endDate"]').attr("content") || "";

    // Extract location details
    const location =
      $element.find('meta[itemprop="name"]').attr("content") || "";

    events.push({
      title: title.replace("Open in a new window", "").trim(),
      imageUrl,
      eventUrl: eventUrl.startsWith("/")
        ? `https://www.sydney.com${eventUrl}`
        : eventUrl,
      dates: {
        start: startDate,
        end: endDate,
      },
      location: location,
      discription,
    });

    eventsTitle.push({
      pageContent: title.replace("Open in a new window", "").trim(),
      metadata: {
        location: location,
        startDate: startDate,
        endDate: endDate,
        source: "sydney.com",
        discription,
      },
    });
  });
}

setInterval(() => {
  fetchEvents().catch((err) => {
    console.error("Error running fetchEvents:", err);
  });
}, 86400000);

export default fetchEvents;
