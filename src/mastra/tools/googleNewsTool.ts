import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const googleNewsTool = createTool({
  id: "google-news",
  description: "Get latest news from Google News",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    max: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Maximum number of articles to return"),
  }),
  outputSchema: z.object({
    articles: z.array(
      z.object({
        title: z.string(),
        description: z.string().nullable(),
        url: z.string(),
        source: z.string(),
        publishedAt: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    return await getNews(context.query, context.max);
  },
});

// Decode HTML/XML entities in text
function decodeXMLEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export async function getNews(query: string, max: number = 5) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  const xml = await response.text();

  // Simple XML parsing using regex
  // Note: In a production environment, should use a proper XML parser
  const articles = [];
  const itemMatches = xml.match(/<item>(.*?)<\/item>/gs) || [];

  for (const item of itemMatches.slice(0, max)) {
    const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const description =
      item.match(/<description>(.*?)<\/description>/)?.[1] || null;
    const url = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const source =
      item.match(/<source.*?>(.*?)<\/source>/)?.[1] || "Google News";
    const publishedAt = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

    const decodedTitle = decodeXMLEntities(title);
    const decodedDescription = description
      ? decodeXMLEntities(description)
      : null;

    articles.push({
      title: decodedTitle,
      description: decodedDescription,
      url,
      source,
      publishedAt,
    });
  }

  return { articles };
}
