import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { GeocodingAPIClient, GeocodingResultSchema } from "./GeocodingAPI";

export const geocodingTool = createTool({
  id: "geocoding",
  description: "Convert an address to geographical coordinates",
  inputSchema: z.object({
    address: z.string().describe("Address to geocode"),
  }),
  outputSchema: GeocodingResultSchema,
  execute: async ({ context }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY environment variable is not set");
    }

    const client = new GeocodingAPIClient(apiKey);
    return await client.searchAddress(context.address);
  },
});
