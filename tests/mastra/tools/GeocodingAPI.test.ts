import { GeocodingAPIClient, GeocodingResultSchema } from '../../../src/mastra/tools/GeocodingAPI';
import { ZodError } from 'zod';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GeocodingAPIClient', () => {
  let client: GeocodingAPIClient;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = vi.fn();

    // Create a new client instance with a dummy API key
    client = new GeocodingAPIClient('dummy-api-key');
  });

  it('should fetch and parse geocoding data successfully', async () => {
    const mockResponse = {
      results: [{
        address_components: [
          {
            long_name: "築地6丁目",
            short_name: "築地6丁目",
            types: ["political", "sublocality", "sublocality_level_3"]
          },
          {
            long_name: "中央区",
            short_name: "中央区",
            types: ["locality", "political"]
          }
        ],
        formatted_address: "日本、〒104-0045 東京都中央区築地６丁目",
        geometry: {
          bounds: {
            northeast: { lat: 35.6663695, lng: 139.7763248 },
            southwest: { lat: 35.6613467, lng: 139.7705683 }
          },
          location: { lat: 35.664281, lng: 139.7735148 },
          location_type: "APPROXIMATE",
          viewport: {
            northeast: { lat: 35.6663695, lng: 139.7763248 },
            southwest: { lat: 35.6613467, lng: 139.7705683 }
          }
        },
        place_id: "ChIJj7pQfGKJGGARicC5hAJklr4",
        types: ["political", "sublocality", "sublocality_level_3"]
      }],
      status: "OK"
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await client.searchAddress('築地6丁目');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://maps.googleapis.com/maps/api/geocode/json?address=%E7%AF%89%E5%9C%B06%E4%B8%81%E7%9B%AE')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=dummy-api-key')
    );

    // Verify that the response matches the schema
    expect(() => GeocodingResultSchema.parse(result)).not.toThrow();
    expect(result.status).toBe('OK');
    expect(result.results[0].formatted_address).toBe('日本、〒104-0045 東京都中央区築地６丁目');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(client.searchAddress('invalid-address'))
      .rejects
      .toThrow('Failed to fetch geocoding data: Not Found');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(client.searchAddress('test-address'))
      .rejects
      .toThrow('Network error');
  });

  it('should throw ZodError for invalid response format', async () => {
    const invalidResponse = {
      results: [{
        // Missing required fields
        formatted_address: "Test Address",
        // geometry is missing required fields
        geometry: {
          location: {
            lat: 35.664281,
            // lng is missing
          }
        }
      }],
      status: "OK"
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(invalidResponse),
    });

    await expect(client.searchAddress('test-address'))
      .rejects
      .toThrow(ZodError);
  });
});
