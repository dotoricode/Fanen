/** 시장 데이터 타입 정의 */

export interface OHLCVPoint {
  time: string;   // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockIndexResponse {
  market: string;
  value: number;
  change: number;
  change_rate: number;
  timestamp: string;
  chart_data: OHLCVPoint[];
  cached: boolean;
  mock: boolean;
}

export interface StockPriceResponse {
  code: string;
  name: string;
  price: number;
  change: number;
  change_rate: number;
  volume: number;
  timestamp: string;
  chart_data: OHLCVPoint[];
  cached: boolean;
  mock: boolean;
}

export interface DisclosureItem {
  title: string;
  date: string;
  url: string;
  type: string;
}

export interface DisclosureResponse {
  code: string;
  disclosures: DisclosureItem[];
  cached: boolean;
}
