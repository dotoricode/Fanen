/** Supabase 데이터베이스 타입 정의 — 11개 테이블 */

/** JSON 타입 (JSONB 컬럼용) */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** 데이터베이스 스키마 최상위 타입 */
export interface Database {
  public: {
    Tables: {
      /** 사용자 프로필 */
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          age_group: '20s' | '30s' | '40s' | '50s' | '60s+' | null;
          ui_mode: 'standard' | 'senior';
          language_level: 'general' | 'expert';
          investment_type: 'aggressive' | 'balanced' | 'conservative' | null;
          subscription_tier: 'free' | 'pro' | 'premium';
          created_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          age_group?: '20s' | '30s' | '40s' | '50s' | '60s+' | null;
          ui_mode?: 'standard' | 'senior';
          language_level?: 'general' | 'expert';
          investment_type?: 'aggressive' | 'balanced' | 'conservative' | null;
          subscription_tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          age_group?: '20s' | '30s' | '40s' | '50s' | '60s+' | null;
          ui_mode?: 'standard' | 'senior';
          language_level?: 'general' | 'expert';
          investment_type?: 'aggressive' | 'balanced' | 'conservative' | null;
          subscription_tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
        };
      };
      /** 포트폴리오 */
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          total_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          total_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          total_value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      /** 배당 시뮬레이션 */
      dividend_simulations: {
        Row: {
          id: string;
          user_id: string;
          portfolio_id: string | null;
          simulation_params: Json | null;
          result: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          portfolio_id?: string | null;
          simulation_params?: Json | null;
          result?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          portfolio_id?: string | null;
          simulation_params?: Json | null;
          result?: Json | null;
          created_at?: string;
        };
      };
      /** 뉴스 영향 분석 (공개) */
      news_impacts: {
        Row: {
          id: string;
          headline: string;
          source: string | null;
          published_at: string | null;
          impact_score: number | null;
          affected_sectors: string[] | null;
          affected_stocks: string[] | null;
          ai_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          source?: string | null;
          published_at?: string | null;
          impact_score?: number | null;
          affected_sectors?: string[] | null;
          affected_stocks?: string[] | null;
          ai_summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          headline?: string;
          source?: string | null;
          published_at?: string | null;
          impact_score?: number | null;
          affected_sectors?: string[] | null;
          affected_stocks?: string[] | null;
          ai_summary?: string | null;
          created_at?: string;
        };
      };
      /** 섹터 인과 관계 맵 (공개) */
      sector_causal_maps: {
        Row: {
          id: string;
          from_sector: string;
          to_sector: string;
          causal_strength: number | null;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_sector: string;
          to_sector: string;
          causal_strength?: number | null;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          from_sector?: string;
          to_sector?: string;
          causal_strength?: number | null;
          description?: string | null;
          updated_at?: string;
        };
      };
      /** 모의투자 시즌 (공개) */
      mock_seasons: {
        Row: {
          id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      /** 모의투자 계좌 */
      mock_accounts: {
        Row: {
          id: string;
          user_id: string;
          season_id: string | null;
          initial_balance: number;
          current_balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          season_id?: string | null;
          initial_balance?: number;
          current_balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          season_id?: string | null;
          initial_balance?: number;
          current_balance?: number;
          created_at?: string;
        };
      };
      /** 모의투자 거래 */
      mock_trades: {
        Row: {
          id: string;
          account_id: string | null;
          user_id: string;
          stock_code: string;
          stock_name: string;
          trade_type: 'buy' | 'sell';
          quantity: number;
          price: number;
          traded_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          user_id: string;
          stock_code: string;
          stock_name: string;
          trade_type: 'buy' | 'sell';
          quantity: number;
          price: number;
          traded_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          user_id?: string;
          stock_code?: string;
          stock_name?: string;
          trade_type?: 'buy' | 'sell';
          quantity?: number;
          price?: number;
          traded_at?: string;
        };
      };
      /** 모의투자 랭킹 (공개) */
      mock_rankings: {
        Row: {
          id: string;
          season_id: string | null;
          user_id: string | null;
          nickname: string | null;
          rank: number | null;
          profit_rate: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id?: string | null;
          user_id?: string | null;
          nickname?: string | null;
          rank?: number | null;
          profit_rate?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string | null;
          user_id?: string | null;
          nickname?: string | null;
          rank?: number | null;
          profit_rate?: number | null;
          updated_at?: string;
        };
      };
      /** 매매 일지 */
      trade_journals: {
        Row: {
          id: string;
          user_id: string;
          trade_id: string | null;
          stock_code: string | null;
          stock_name: string | null;
          note: string | null;
          emotion: string | null;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trade_id?: string | null;
          stock_code?: string | null;
          stock_name?: string | null;
          note?: string | null;
          emotion?: string | null;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trade_id?: string | null;
          stock_code?: string | null;
          stock_name?: string | null;
          note?: string | null;
          emotion?: string | null;
          ai_feedback?: string | null;
          created_at?: string;
        };
      };
      /** 배당 캘린더 (공개) */
      dividend_calendar: {
        Row: {
          id: string;
          stock_code: string;
          stock_name: string;
          ex_dividend_date: string | null;
          payment_date: string | null;
          dividend_amount: number | null;
          dividend_yield: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stock_code: string;
          stock_name: string;
          ex_dividend_date?: string | null;
          payment_date?: string | null;
          dividend_amount?: number | null;
          dividend_yield?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stock_code?: string;
          stock_name?: string;
          ex_dividend_date?: string | null;
          payment_date?: string | null;
          dividend_amount?: number | null;
          dividend_yield?: number | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
