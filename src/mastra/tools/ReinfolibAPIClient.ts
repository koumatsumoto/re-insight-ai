import { z } from "zod";

// パラメータのスキーマ定義
const RealEstateQueryParamsSchema = z.object({
  priceClassification: z.string().length(2).regex(/^\d{2}$/),
  year: z.string().length(4).regex(/^\d{4}$/),
  quarter: z.string().length(1).regex(/^[1-4]$/),
  area: z.string().length(2).regex(/^\d{2}$/).optional(),
  city: z.string().length(5).regex(/^\d{5}$/).optional(),
  station: z.string().length(6).regex(/^\d{6}$/).optional(),
  language: z.enum(["ja", "en"]),
}).refine(
  (data) => data.area !== undefined || data.city !== undefined || data.station !== undefined,
  { message: "At least one of area, city, or station must be specified" }
);

// レスポンスのスキーマ定義
const RealEstateDataSchema = z.object({
  PriceCategory: z.string(),
  Type: z.string(),
  Region: z.string(),
  MunicipalityCode: z.string(),
  Prefecture: z.string(),
  Municipality: z.string(),
  DistrictName: z.string(),
  TradePrice: z.string(),
  PricePerUnit: z.string(),
  FloorPlan: z.string(),
  Area: z.string(),
  UnitPrice: z.string(),
  LandShape: z.string(),
  Frontage: z.string(),
  TotalFloorArea: z.string(),
  BuildingYear: z.string(),
  Structure: z.string(),
  Use: z.string(),
  Purpose: z.string(),
  Direction: z.string(),
  Classification: z.string(),
  Breadth: z.string(),
  CityPlanning: z.string(),
  CoverageRatio: z.string(),
  FloorAreaRatio: z.string(),
  Period: z.string(),
  Renovation: z.string(),
  Remarks: z.string()
});

const RealEstateResponseSchema = z.object({
  status: z.string(),
  data: z.array(RealEstateDataSchema)
});

export type RealEstateQueryParams = z.infer<typeof RealEstateQueryParamsSchema>;
export type RealEstateData = z.infer<typeof RealEstateDataSchema>;
export type RealEstateResponse = z.infer<typeof RealEstateResponseSchema>;
export { RealEstateResponseSchema };

export class ReinfolibAPIClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://www.reinfolib.mlit.go.jp/ex-api/external";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRealEstateTransaction(params: RealEstateQueryParams): Promise<RealEstateResponse> {
    // パラメータのバリデーション
    RealEstateQueryParamsSchema.parse(params);

    // URLパラメータの構築
    const queryParams = new URLSearchParams({
      priceClassification: params.priceClassification,
      year: params.year,
      quarter: params.quarter,
      language: params.language,
      ...(params.area && { area: params.area }),
      ...(params.city && { city: params.city }),
      ...(params.station && { station: params.station }),
    });

    const url = `${this.baseUrl}/XIT001?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch real estate data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    return RealEstateResponseSchema.parse(data);
  }
}
