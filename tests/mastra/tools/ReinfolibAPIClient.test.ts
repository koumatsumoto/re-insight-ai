import { ReinfolibAPIClient, RealEstateResponseSchema, RealEstateQueryParams } from '../../../src/mastra/tools/ReinfolibAPIClient';
import { ZodError } from 'zod';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ReinfolibAPIClient', () => {
  let client: ReinfolibAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    client = new ReinfolibAPIClient('dummy-api-key');
  });

  it('should fetch and parse real estate data successfully', async () => {
    const mockResponse = [
      {
        Type: "中古マンション等",
        Region: "住宅地",
        MunicipalityCode: "13101",
        Prefecture: "東京都",
        Municipality: "千代田区",
        DistrictName: "大手町",
        TradePrice: 50000000,
        PricePerUnit: 2500000,
        FloorPlan: "3LDK",
        Area: 75.5,
        UnitPrice: 662251,
        LandShape: "ほぼ長方形",
        Frontage: "10m以上",
        TotalFloorArea: 85.5,
        BuildingYear: "平成10年",
        Structure: "ＳＲＣ",
        Use: "住宅",
        Purpose: "住宅",
        Direction: "南",
        Classification: "区道",
        Breadth: "6m",
        CityPlanning: "商業地域",
        CoverageRatio: 80,
        FloorAreaRatio: 500,
        Period: "2024年第1四半期",
        Renovation: "改装済",
        Remarks: null
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const params: RealEstateQueryParams = {
      priceClassification: "01",
      year: "2024",
      quarter: "1",
      area: "13",
      language: "ja" as const
    };

    const result = await client.getRealEstateTransaction(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?'),
      expect.objectContaining({
        headers: {
          "Ocp-Apim-Subscription-Key": "dummy-api-key"
        }
      })
    );

    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('priceClassification=01');
    expect(url).toContain('year=2024');
    expect(url).toContain('quarter=1');
    expect(url).toContain('area=13');
    expect(url).toContain('language=ja');

    expect(() => RealEstateResponseSchema.parse(result)).not.toThrow();
    expect(result[0].Prefecture).toBe('東京都');
    expect(result[0].Municipality).toBe('千代田区');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    });

    const params: RealEstateQueryParams = {
      priceClassification: "01",
      year: "2024",
      quarter: "1",
      area: "13",
      language: "ja" as const
    };

    await expect(client.getRealEstateTransaction(params))
      .rejects
      .toThrow('Failed to fetch real estate data: Unauthorized');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const params: RealEstateQueryParams = {
      priceClassification: "01",
      year: "2024",
      quarter: "1",
      area: "13",
      language: "ja" as const
    };

    await expect(client.getRealEstateTransaction(params))
      .rejects
      .toThrow('Network error');
  });

  it('should throw ZodError for invalid response format', async () => {
    const invalidResponse = [{
      // Missing required fields
      Type: "中古マンション等",
      // Region is missing
      Prefecture: "東京都",
      // Other required fields are missing
    }];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(invalidResponse),
    });

    const params: RealEstateQueryParams = {
      priceClassification: "01",
      year: "2024",
      quarter: "1",
      area: "13",
      language: "ja" as const
    };

    await expect(client.getRealEstateTransaction(params))
      .rejects
      .toThrow(ZodError);
  });

  it('should validate query parameters', async () => {
    const invalidParams = {
      priceClassification: "invalid", // should be 2 digits
      year: "2024",
      quarter: "1",
      language: "ja" as const
      // missing area/city/station
    };

    await expect(client.getRealEstateTransaction(invalidParams as any))
      .rejects
      .toThrow(ZodError);
  });

  it('should require at least one location parameter', async () => {
    const paramsWithoutLocation = {
      priceClassification: "01",
      year: "2024",
      quarter: "1",
      language: "ja" as const
      // missing area/city/station
    };

    await expect(client.getRealEstateTransaction(paramsWithoutLocation))
      .rejects
      .toThrow("At least one of area, city, or station must be specified");
  });
});
