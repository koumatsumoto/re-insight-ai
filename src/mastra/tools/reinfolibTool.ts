import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ReinfolibAPIClient, RealEstateResponseSchema } from "./ReinfolibAPIClient";

export const reinfolibTool = createTool({
  id: "reinfolib",
  description: "Search real estate transaction data from Real Estate Information Library",
  inputSchema: z
    .object({
      priceClassification: z
        .string()
        .length(2)
        .regex(/^\d{2}$/)
        .describe("Price classification code (2 digits)"),
      year: z
        .string()
        .length(4)
        .regex(/^\d{4}$/)
        .describe("Target year (YYYY)"),
      quarter: z
        .string()
        .length(1)
        .regex(/^[1-4]$/)
        .describe("Target quarter (1-4)"),
      area: z
        .string()
        .length(2)
        .regex(/^\d{2}$/)
        .optional()
        .describe("Area code (2 digits)"),
      city: z
        .string()
        .length(5)
        .regex(/^\d{5}$/)
        .optional()
        .describe("City code (5 digits)"),
      station: z
        .string()
        .length(6)
        .regex(/^\d{6}$/)
        .optional()
        .describe("Station code (6 digits)"),
      language: z.enum(["ja", "en"]).describe("Response language (ja/en)"),
    })
    .refine((data) => data.area !== undefined || data.city !== undefined || data.station !== undefined, {
      message: "At least one of area, city, or station must be specified",
    }),
  outputSchema: RealEstateResponseSchema,
  execute: async ({ context }) => {
    const apiKey = process.env.REINFOLIB_API_KEY;
    if (!apiKey) {
      throw new Error("REINFOLIB_API_KEY environment variable is not set");
    }

    const client = new ReinfolibAPIClient(apiKey);
    return await client.getRealEstateTransaction(context);
  },
});
