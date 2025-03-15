import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNews } from "../../../src/mastra/tools/googleNewsTool";

describe("googleNewsTool", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it("should fetch and parse news articles", async () => {
    const mockXmlResponse = `
      <rss version="2.0">
        <channel>
          <item>
            <title>Test Title "quoted"</title>
            <description>Test Description & more</description>
            <link>http://example.com/1</link>
            <source url="http://source.com">Test Source</source>
            <pubDate>Wed, 06 Mar 2024 12:00:00 GMT</pubDate>
          </item>
          <item>
            <title>Second Title</title>
            <description>Second Description</description>
            <link>http://example.com/2</link>
            <source url="http://source2.com">Test Source 2</source>
            <pubDate>Wed, 06 Mar 2024 13:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockXmlResponse),
    });

    const result = await getNews("test query", 2);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://news.google.com/rss/search?q=test%20query"),
    );

    expect(result.articles).toHaveLength(2);
    expect(result.articles[0]).toEqual({
      title: 'Test Title "quoted"',
      description: "Test Description & more",
      url: "http://example.com/1",
      source: "Test Source",
      publishedAt: "Wed, 06 Mar 2024 12:00:00 GMT",
    });
  });

  it("should respect the max parameter", async () => {
    const mockXmlResponse = `
      <rss version="2.0">
        <channel>
          <item>
            <title>Title 1</title>
            <link>http://example.com/1</link>
            <pubDate>Wed, 06 Mar 2024 12:00:00 GMT</pubDate>
          </item>
          <item>
            <title>Title 2</title>
            <link>http://example.com/2</link>
            <pubDate>Wed, 06 Mar 2024 13:00:00 GMT</pubDate>
          </item>
          <item>
            <title>Title 3</title>
            <link>http://example.com/3</link>
            <pubDate>Wed, 06 Mar 2024 14:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockXmlResponse),
    });

    const result = await getNews("test", 2);

    expect(result.articles).toHaveLength(2);
  });

  it("should handle missing optional fields", async () => {
    const mockXmlResponse = `
      <rss version="2.0">
        <channel>
          <item>
            <title>Test Title</title>
            <link>http://example.com/1</link>
          </item>
        </channel>
      </rss>
    `;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockXmlResponse),
    });

    const result = await getNews("test");

    expect(result.articles[0]).toEqual({
      title: "Test Title",
      description: null,
      url: "http://example.com/1",
      source: "Google News",
      publishedAt: "",
    });
  });

  it("should handle network errors", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(getNews("test")).rejects.toThrow("Network error");
  });

  it("should handle API errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    await expect(getNews("test")).rejects.toThrow("Failed to fetch news: Not Found");
  });

  it("should handle empty response", async () => {
    const mockXmlResponse = `
      <rss version="2.0">
        <channel>
        </channel>
      </rss>
    `;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockXmlResponse),
    });

    const result = await getNews("test");

    expect(result.articles).toHaveLength(0);
  });
});
