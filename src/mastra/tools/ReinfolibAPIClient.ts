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
  Type: z.string(),
  Region: z.string(),
  MunicipalityCode: z.string(),
  Prefecture: z.string(),
  Municipality: z.string(),
  DistrictName: z.string(),
  TradePrice: z.number(),
  PricePerUnit: z.number().nullable(),
  FloorPlan: z.string().nullable(),
  Area: z.number().nullable(),
  UnitPrice: z.number().nullable(),
  LandShape: z.string().nullable(),
  Frontage: z.string().nullable(),
  TotalFloorArea: z.number().nullable(),
  BuildingYear: z.string().nullable(),
  Structure: z.string().nullable(),
  Use: z.string().nullable(),
  Purpose: z.string().nullable(),
  Direction: z.string().nullable(),
  Classification: z.string().nullable(),
  Breadth: z.string().nullable(),
  CityPlanning: z.string().nullable(),
  CoverageRatio: z.number().nullable(),
  FloorAreaRatio: z.number().nullable(),
  Period: z.string(),
  Renovation: z.string().nullable(),
  Remarks: z.string().nullable(),
});

const RealEstateResponseSchema = z.array(RealEstateDataSchema);

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
    return RealEstateResponseSchema.parse(data);
  }
}
