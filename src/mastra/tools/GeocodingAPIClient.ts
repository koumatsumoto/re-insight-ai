import { z } from "zod";

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const BoundsSchema = z.object({
  northeast: LatLngSchema,
  southwest: LatLngSchema,
});

const AddressComponentSchema = z.object({
  long_name: z.string(),
  short_name: z.string(),
  types: z.array(z.string()),
});

const GeometrySchema = z.object({
  bounds: BoundsSchema,
  location: LatLngSchema,
  location_type: z.string(),
  viewport: BoundsSchema,
});

const GeocodingResultSchema = z.object({
  results: z.array(
    z.object({
      address_components: z.array(AddressComponentSchema),
      formatted_address: z.string(),
      geometry: GeometrySchema,
      place_id: z.string(),
      types: z.array(z.string()),
    }),
  ),
  status: z.string(),
});

export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export { GeocodingResultSchema };

export class GeocodingAPIClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchAddress(address: string): Promise<GeocodingResult> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch geocoding data: ${response.statusText}`);
    }

    const data = await response.json();
    return GeocodingResultSchema.parse(data);
  }
}
