import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geocodingTool } from "../../../src/mastra/tools/geocodingTool";
import { GeocodingAPIClient } from "../../../src/mastra/tools/GeocodingAPI";

type StepResult<T> = {
  result?: T;
  error?: Error;
};

type WorkflowContext<T> = {
  steps: Record<string, StepResult<any>>;
  triggerData: Record<string, any>;
  attempts: number;
  getStepResult: () => any;
} & T;

vi.mock("../../../src/mastra/tools/GeocodingAPIClient", () => {
  return {
    GeocodingAPIClient: vi.fn().mockImplementation(() => ({
      searchAddress: vi.fn().mockResolvedValue({
        results: [
          {
            address_components: [
              {
                long_name: "Tokyo",
                short_name: "Tokyo",
                types: ["administrative_area_level_1", "political"],
              },
            ],
            formatted_address: "Tokyo, Japan",
            geometry: {
              bounds: {
                northeast: { lat: 35.8986, lng: 139.9059 },
                southwest: { lat: 35.5195, lng: 138.9478 },
              },
              location: { lat: 35.6762, lng: 139.6503 },
              location_type: "APPROXIMATE",
              viewport: {
                northeast: { lat: 35.8986, lng: 139.9059 },
                southwest: { lat: 35.5195, lng: 138.9478 },
              },
            },
            place_id: "ChIJ51cu8IcbXWARiRtXIothAS4",
            types: ["administrative_area_level_1", "political"],
          },
        ],
        status: "OK",
      }),
    })),
    GeocodingResultSchema: vi.fn(),
  };
});

interface GeocodingResult {
  results: Array<{
    formatted_address: string;
    [key: string]: any;
  }>;
  status: string;
}

describe("geocodingTool", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GOOGLE_MAPS_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  const createMockContext = (address: string): WorkflowContext<{ address: string }> => ({
    address,
    steps: {},
    triggerData: {},
    attempts: 0,
    getStepResult: () => undefined,
  });

  it("should have correct id and description", () => {
    expect(geocodingTool.id).toBe("geocoding");
    expect(geocodingTool.description).toBe("Convert an address to geographical coordinates");
  });

  it("should throw error if API key is not set", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    const tool = geocodingTool as { execute: Function };
    await expect(
      tool.execute({
        context: createMockContext("Tokyo"),
        suspend: async () => {},
      }),
    ).rejects.toThrow("GOOGLE_MAPS_API_KEY environment variable is not set");
  });

  it("should return geocoding result for valid address", async () => {
    const tool = geocodingTool as { execute: Function };
    const result = (await tool.execute({
      context: createMockContext("Tokyo"),
      suspend: async () => {},
    })) as GeocodingResult;
    expect(result.status).toBe("OK");
    expect(result.results[0].formatted_address).toBe("Tokyo, Japan");
  });
});
