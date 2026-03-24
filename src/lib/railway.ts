/**
 * Railway FastAPI 서버 호출 클라이언트
 * 타입 안전하고 인증 헤더가 자동으로 포함된 API 클라이언트
 */
import type {
  NewsAnalyzeRequest,
  NewsAnalyzeResponse,
  SectorCausalRequest,
  SectorCausalResponse,
} from "@/types/railway.types";

// Railway API 기본 URL (환경변수에서 읽기)
const RAILWAY_API_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || "http://localhost:8000";

// 요청 타임아웃 (30초)
const REQUEST_TIMEOUT_MS = 30_000;

/** Railway API 에러 클래스 */
export class RailwayApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    message: string
  ) {
    super(message);
    this.name = "RailwayApiError";
  }
}

/**
 * Supabase 세션 토큰을 Authorization 헤더에 자동 전달하는 기본 fetch 함수
 * @param path API 경로 (예: '/api/news/analyze')
 * @param options fetch 옵션
 * @param accessToken Supabase 세션 액세스 토큰 (선택)
 */
export async function railwayFetch(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const url = `${RAILWAY_API_URL}${path}`;

  // 타임아웃 AbortController 설정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Supabase 세션 토큰을 Authorization 헤더에 자동 포함
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    // 에러 응답 처리
    if (!response.ok) {
      let detail = "알 수 없는 오류가 발생했습니다";
      try {
        const errorBody = await response.json();
        detail = errorBody.detail || detail;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new RailwayApiError(
        response.status,
        detail,
        `Railway API 오류 [${response.status}]: ${detail}`
      );
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 뉴스 헤드라인 임팩트 분석 요청
 * @param request 뉴스 분석 요청 데이터
 * @param accessToken Supabase 세션 액세스 토큰
 */
export async function analyzeNews(
  request: NewsAnalyzeRequest,
  accessToken?: string
): Promise<NewsAnalyzeResponse> {
  const response = await railwayFetch(
    "/api/news/analyze",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    accessToken
  );

  return response.json() as Promise<NewsAnalyzeResponse>;
}

/** AI 코치 "핀이" 질문 응답 — KRX/DART 수치는 Railway에서만 생성 */
export async function askCoach(
  params: { question: string; language_level?: 'general' | 'expert' },
  accessToken?: string
): Promise<{ answer: string; source_urls: string[]; disclaimer: string }> {
  try {
    const response = await railwayFetch(
      '/api/coach/ask',
      { method: 'POST', body: JSON.stringify(params) },
      accessToken
    );
    return response.json();
  } catch {
    return {
      answer: '현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
      source_urls: [],
      disclaimer: 'AI 분석 결과는 투자 참고자료이며, 투자 판단의 책임은 이용자에게 있습니다.',
    };
  }
}

/**
 * 섹터 인과관계 맵 분석 요청
 * @param request 섹터 인과관계 분석 요청 데이터
 * @param accessToken Supabase 세션 액세스 토큰
 */
export async function getSectorCausalMap(
  request: SectorCausalRequest,
  accessToken?: string
): Promise<SectorCausalResponse> {
  const response = await railwayFetch(
    "/api/sector/causal",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    accessToken
  );

  return response.json() as Promise<SectorCausalResponse>;
}
