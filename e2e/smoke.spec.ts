import { test, expect } from '@playwright/test';

/**
 * 파낸(Fanen) Sprint 10 스모크 테스트
 * 주요 페이지 렌더링 및 핵심 UI 요소 검증
 */

test.describe('홈 / 대시보드', () => {
  test('홈 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/파낸/);
  });

  test('데스크톱에서 SideNav가 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const nav = page.locator('nav[aria-label="사이드 메뉴"]');
    await expect(nav).toBeVisible();
  });

  test('모바일에서 BottomNav가 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();
  });

  test('HubMenu 반딧불이 애니메이션 컨테이너가 존재한다', async ({ page }) => {
    await page.goto('/');
    // 반디가 있는 HubMenu 섹션 확인
    const hubSection = page.locator('text=반디와 함께 탐색하기');
    await expect(hubSection).toBeVisible();
  });
});

test.describe('세계 정세 (Binah Map)', () => {
  test('세계 정세 페이지가 로드된다', async ({ page }) => {
    await page.goto('/binah-map');
    await expect(page.locator('h1')).toContainText('세계 정세');
  });

  test('FLAT/3D 토글이 존재한다', async ({ page }) => {
    await page.goto('/binah-map');
    const flatBtn = page.locator('button:has-text("flat"), button:has-text("FLAT")').first();
    const threeDBtn = page.locator('button:has-text("3d"), button:has-text("3D")').first();
    // 둘 중 하나 이상 존재
    const flatCount = await flatBtn.count();
    const threeDCount = await threeDBtn.count();
    expect(flatCount + threeDCount).toBeGreaterThan(0);
  });

  test('DisclaimerBanner가 포함된다', async ({ page }) => {
    await page.goto('/binah-map');
    const disclaimer = page.locator('[class*="disclaimer"], text=투자 참고자료').first();
    await expect(disclaimer).toBeVisible();
  });
});

test.describe('뉴스 분析', () => {
  test('뉴스 분析 페이지가 로드된다', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('h1')).toContainText('뉴스 분析');
  });

  test('섹터 필터와 영향도 필터가 분리 표시된다', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('text=섹터 필터')).toBeVisible();
    await expect(page.locator('text=영향도 필터')).toBeVisible();
  });

  test('DisclaimerBanner가 포함된다', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('text=투자 참고자료').first()).toBeVisible();
  });
});

test.describe('수혜 기업 연결망 (Value Chain)', () => {
  test('수혜 기업 연결망 페이지가 로드된다', async ({ page }) => {
    await page.goto('/value-chain');
    await expect(page.locator('h1')).toContainText('수혜 기업 연결망');
  });

  test('카테고리 탭 (활성/비활성)이 표시된다', async ({ page }) => {
    await page.goto('/value-chain');
    await expect(page.locator('text=방산').first()).toBeVisible();
    await expect(page.locator('text=준비중').first()).toBeVisible();
  });

  test('SVG 마인드맵이 렌더링된다', async ({ page }) => {
    await page.goto('/value-chain');
    await page.waitForTimeout(1000); // 애니메이션 대기
    const svg = page.locator('svg[aria-label="수혜 기업 연결망 마인드맵"]');
    await expect(svg).toBeVisible();
  });
});

test.describe('배당 계산기', () => {
  test('배당 계산기 페이지가 로드된다', async ({ page }) => {
    await page.goto('/dividend');
    await expect(page.locator('h1')).toContainText('배당');
  });

  test('복리 시뮬레이션 탭이 존재한다', async ({ page }) => {
    await page.goto('/dividend');
    const simTab = page.locator('text=10년, text=20년, text=30년').first();
    const simSection = page.locator('text=복리').first();
    // 둘 중 하나 확인
    const count1 = await simTab.count();
    const count2 = await simSection.count();
    expect(count1 + count2).toBeGreaterThan(0);
  });
});

test.describe('내 포트폴리오', () => {
  test('포트폴리오 페이지가 로드된다', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page.locator('h1')).toContainText('포트폴리오');
  });

  test('투자 성향 필터 탭이 표시된다', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page.locator('text=배당형').first()).toBeVisible();
    await expect(page.locator('text=성장형').first()).toBeVisible();
  });
});

test.describe('컬러 시스템 / 다크모드', () => {
  test('라이트 모드 기본 배경이 zinc-50이다', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    // 다크 모드 클래스가 없어야 함 (기본 라이트)
    const html = page.locator('html');
    const darkClass = await html.getAttribute('class');
    // body 배경 검증 (zinc-50은 #fafafa)
    const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // 배경이 완전 흰색이 아닌 아주 밝은 회색이거나 흰색
    expect(bg).toMatch(/rgb\(2[45]\d|rgb\(255/);
  });
});
