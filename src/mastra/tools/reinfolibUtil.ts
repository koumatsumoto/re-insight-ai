type TileZoom = 15 | 16 | 17;

/**
 * 緯度経度をタイル座標（X, Y）に変換する処理
 * タイル座標は不動産情報ライブラリで使用するための値で、拡大率（ズームレベル）によって変わる
 * https://www.reinfolib.mlit.go.jp/help/apiManual
 *
 * @param lat
 * @param lon
 * @param zoom
 * @returns
 */
export function convertLatLonToTileXY(
  lat: number,
  lon: number,
  zoom: TileZoom
) {
  const n = Math.pow(2, zoom);
  const latRad = radians(lat);
  const x = Math.floor(n * ((lon + 180) / 360));
  const y = Math.floor(
    (n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2
  );
  return [x, y];
}

function radians(degrees: number) {
  return degrees * (Math.PI / 180);
}
