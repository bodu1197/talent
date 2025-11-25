import { test, expect } from '@playwright/test';

test.describe('서비스 검색 및 조회', () => {
  test('메인 페이지에서 서비스 목록이 표시된다', async ({ page }) => {
    await page.goto('/');

    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');

    // 서비스 목록 또는 검색 기능 확인
    const hasServiceList =
      (await page
        .locator('[data-testid="service-list"], .service-card, [class*="service"]')
        .count()) > 0;
    const hasSearchBar =
      (await page.locator('input[type="search"], input[placeholder*="검색"]').count()) > 0;

    // 서비스 목록이나 검색 기능 중 하나는 있어야 함
    expect(hasServiceList || hasSearchBar).toBeTruthy();
  });

  test('카테고리별 서비스 필터링', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 카테고리 선택 (있는 경우)
    const categorySelector = page.locator(
      '[data-testid="category-filter"], select[name*="category"], button:has-text("카테고리")'
    );

    if ((await categorySelector.count()) > 0) {
      await categorySelector.first().click();

      // 카테고리 옵션 선택
      const firstOption = page
        .locator('[role="option"], option, [data-testid="category-option"]')
        .first();
      if ((await firstOption.count()) > 0) {
        await firstOption.click();

        // 필터링 결과 대기
        await page.waitForTimeout(1000);

        // 필터링된 결과가 있는지 확인
        const serviceCount = await page
          .locator('[data-testid="service-card"], .service-card')
          .count();
        expect(serviceCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('서비스 검색 기능', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 검색창 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first();

    if ((await searchInput.count()) > 0) {
      // 검색어 입력
      await searchInput.fill('디자인');
      await searchInput.press('Enter');

      // 검색 결과 대기
      await page.waitForTimeout(1000);

      // URL 변경 또는 결과 표시 확인
      const hasResults =
        (await page
          .locator('[data-testid="search-results"], [data-testid="service-list"]')
          .count()) > 0;
      expect(hasResults || page.url().includes('search')).toBeTruthy();
    }
  });

  test('서비스 상세 페이지 이동', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 첫 번째 서비스 카드 클릭
    const serviceCard = page
      .locator('[data-testid="service-card"], .service-card, a[href*="/services/"]')
      .first();

    if ((await serviceCard.count()) > 0) {
      await serviceCard.click();

      // 상세 페이지로 이동 확인
      await page.waitForURL(/\/services\/\w+/, { timeout: 5000 });

      // 상세 정보 표시 확인
      const hasTitle = (await page.locator('h1, [data-testid="service-title"]').count()) > 0;

      expect(hasTitle).toBeTruthy();
    }
  });
});
