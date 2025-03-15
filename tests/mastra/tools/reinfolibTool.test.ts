import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reinfolibTool } from "../../../src/mastra/tools/reinfolibTool";
import { ReinfolibAPIClient } from "../../../src/mastra/tools/ReinfolibAPIClient";

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

vi.mock("../../../src/mastra/tools/ReinfolibAPIClient", () => {
  return {
    ReinfolibAPIClient: vi.fn().mockImplementation(() => ({
      getRealEstateTransaction: vi.fn().mockResolvedValue([
        {
          Type: "中古マンション等",
          Region: "東京都",
          MunicipalityCode: "13101",
          Prefecture: "東京都",
          Municipality: "千代田区",
          DistrictName: "丸の内",
          TradePrice: 50000000,
          PricePerUnit: 1000000,
          FloorPlan: "2LDK",
          Area: 50,
          UnitPrice: 1000000,
          LandShape: "ほぼ長方形",
          Frontage: "10m以上",
          TotalFloorArea: 50,
          BuildingYear: "2020",
          Structure: "RC",
          Use: "住宅",
          Purpose: "住宅",
          Direction: "南",
          Classification: "区分所有建物",
          Breadth: "10m以上",
          CityPlanning: "商業地域",
          CoverageRatio: 80,
          FloorAreaRatio: 400,
          Period: "2023第4四半期",
          Renovation: null,
          Remarks: null,
        },
      ]),
    })),
    RealEstateResponseSchema: vi.fn(),
  };
});

interface RealEstateContext {
  priceClassification: string;
  year: string;
  quarter: string;
  area?: string;
  city?: string;
  station?: string;
  language: "ja" | "en";
}

describe("reinfolibTool", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REINFOLIB_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  const createMockContext = (params: RealEstateContext): WorkflowContext<RealEstateContext> => ({
    ...params,
    steps: {},
    triggerData: {},
    attempts: 0,
    getStepResult: () => undefined,
  });

  it("should have correct id and description", () => {
    expect(reinfolibTool.id).toBe("reinfolib");
    expect(reinfolibTool.description).toBe("Search real estate transaction data from Real Estate Information Library");
  });

  it("should throw error if API key is not set", async () => {
    delete process.env.REINFOLIB_API_KEY;
    const tool = reinfolibTool as { execute: Function };
    await expect(
      tool.execute({
        context: createMockContext({
          priceClassification: "01",
          year: "2023",
          quarter: "4",
          city: "13101",
          language: "ja",
        }),
        suspend: async () => {},
      }),
    ).rejects.toThrow("REINFOLIB_API_KEY environment variable is not set");
  });

  it("should return real estate transaction data for valid parameters", async () => {
    const tool = reinfolibTool as { execute: Function };
    const result = await tool.execute({
      context: createMockContext({
        priceClassification: "01",
        year: "2023",
        quarter: "4",
        city: "13101",
        language: "ja",
      }),
      suspend: async () => {},
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({
      Type: "中古マンション等",
      Region: "東京都",
      Municipality: "千代田区",
      DistrictName: "丸の内",
      TradePrice: 50000000,
    });
  });
});
