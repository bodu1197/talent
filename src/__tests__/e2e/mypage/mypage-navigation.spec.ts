import { test, expect } from '@playwright/test'

test.describe('마이페이지 네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'ohyus1197@gmail.com')
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || '')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(mypage|admin)/, { timeout: 10000 })
  })

  test('마이페이지 접근 및 기본 정보 표시', async ({ page }) => {
    await page.goto('/mypage')

    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle')

    // 마이페이지 URL 확인
    expect(page.url()).toContain('/mypage')

    // 사용자 정보 표시 확인
    const hasUserInfo = await page.locator('[data-testid="user-profile"], .user-info, text=/프로필|Profile/').count() > 0
    expect(hasUserInfo).toBeTruthy()
  })

  test('마이페이지 탭 네비게이션', async ({ page }) => {
    await page.goto('/mypage')
    await page.waitForLoadState('networkidle')

    // 구매자 탭이 있는지 확인
    const buyerTab = page.locator('a[href*="/mypage/buyer"], button:has-text("구매"), [data-testid="buyer-tab"]').first()

    if (await buyerTab.count() > 0) {
      await buyerTab.click()
      await page.waitForTimeout(500)

      // URL 변경 또는 콘텐츠 변경 확인
      const hasBuyerContent = await page.locator('[data-testid="buyer-dashboard"], text=/구매|주문/').count() > 0
      expect(hasBuyerContent || page.url().includes('buyer')).toBeTruthy()
    }

    // 판매자 탭이 있는지 확인
    const sellerTab = page.locator('a[href*="/mypage/seller"], button:has-text("판매"), [data-testid="seller-tab"]').first()

    if (await sellerTab.count() > 0) {
      await sellerTab.click()
      await page.waitForTimeout(500)

      // URL 변경 또는 콘텐츠 변경 확인
      const hasSellerContent = await page.locator('[data-testid="seller-dashboard"], text=/판매|서비스/').count() > 0
      expect(hasSellerContent || page.url().includes('seller')).toBeTruthy()
    }
  })

  test('F5 새로고침 후에도 정상 작동', async ({ page }) => {
    await page.goto('/mypage')
    await page.waitForLoadState('networkidle')

    // 페이지 새로고침
    await page.reload()

    // 로딩 완료 대기 (최대 10초)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // 여전히 마이페이지에 있는지 확인
    expect(page.url()).toContain('/mypage')

    // 무한 로딩이 아닌지 확인 (로딩 스피너가 사라졌는지)
    await page.waitForTimeout(2000)
    const hasLoadingSpinner = await page.locator('[data-testid="loading"], .animate-spin, text=/로딩|Loading/').count() > 0

    // 로딩 스피너가 없어야 함 (또는 있더라도 곧 사라져야 함)
    if (hasLoadingSpinner) {
      await expect(page.locator('[data-testid="loading"], .animate-spin')).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('로그아웃 기능', async ({ page }) => {
    await page.goto('/mypage')
    await page.waitForLoadState('networkidle')

    // 로그아웃 버튼 찾기
    const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃"), [data-testid="logout"]').first()

    if (await logoutButton.count() > 0) {
      await logoutButton.click()

      // 로그인 페이지 또는 메인 페이지로 리디렉션 대기
      await page.waitForURL(/\/(auth\/login|^\/$)/, { timeout: 5000 })

      // 로그아웃 확인 - 마이페이지 접근 시 로그인 페이지로 리디렉션
      await page.goto('/mypage')
      await page.waitForURL(/\/auth\/login/, { timeout: 5000 })
      expect(page.url()).toContain('/auth/login')
    }
  })
})
