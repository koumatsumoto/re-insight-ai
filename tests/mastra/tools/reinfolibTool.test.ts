import { describe, it, expect } from 'vitest';
import { convertLatLonToTileXY } from '../../../src/mastra/tools/reinfolibTool';

describe('reinfolibTool', () => {
  describe('convertLatLonToTileXY', () => {
    // 六本木駅の座標
    const lat = 35.6638271;
    const lon = 139.7316455;

    it('should convert coordinates to tile XY at zoom level 15', () => {
      const [x, y] = convertLatLonToTileXY(lat, lon, 15);
      expect(x).toBe(29102);
      expect(y).toBe(12905);
    });

    it('should convert coordinates to tile XY at zoom level 16', () => {
      const [x, y] = convertLatLonToTileXY(lat, lon, 16);
      expect(x).toBe(58205);
      expect(y).toBe(25810);
    });

    it('should convert coordinates to tile XY at zoom level 17', () => {
      const [x, y] = convertLatLonToTileXY(lat, lon, 17);
      expect(x).toBe(116410);
      expect(y).toBe(51621);
    });
  });
});
