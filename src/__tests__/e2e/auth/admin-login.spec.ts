import { test, expect } from '@playwright/test'

test.describe('관리자 로그인', () => {
  test('올바른 관리자 계정으로 로그인할 수 있다', async ({ page }) => {
    await page.goto('/auth/login')

    // 로그인 페이지 렌더링 확인
    await expect(page.locator('h1')).toContainText(/로그인|Login/)

    // 이메일과 비밀번호 입력
    await page.fill('input[name="email"]', 'ohyus1197@gmail.com')
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || '')

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')

    // 로그인 성공 후 리디렉션 대기
    await page.waitForURL(/\/(mypage|admin)/, { timeout: 10000 })

    // URL이 마이페이지 또는 관리자 페이지인지 확인
    const url = page.url()
    expect(url).toMatch(/\/(mypage|admin)/)
  })

  test('관리자는 관리자 대시보드에 접근할 수 있다', async ({ page }) => {
    // 먼저 로그인
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'ohyus1197@gmail.com')
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || '')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(mypage|admin)/, { timeout: 10000 })

    // 관리자 대시보드로 이동
    await page.goto('/admin/dashboard')

    // 관리자 대시보드 로딩 완료 대기
    await page.waitForLoadState('networkidle')

    // URL이 관리자 페이지인지 확인
    expect(page.url()).toContain('/admin/dashboard')

    // 관리자 페이지 콘텐츠 확인
    await expect(page.locator('body')).not.toContainText(/권한이 없습니다|Unauthorized/)
  })

  test('일반 사용자는 관리자 페이지에 접근할 수 없다', async ({ page }) => {
    // 비로그인 상태에서 관리자 페이지 접근 시도
    await page.goto('/admin/dashboard')

    // 로그인 페이지로 리디렉션되는지 확인
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[name="email"]', 'ohyus1197@gmail.com')
    await page.fill('input[name="password"]', 'wrongpassword123')

    await page.click('button[type="submit"]')

    // 에러 메시지 표시 확인
    await expect(page.locator('text=/잘못된|Invalid|실패|Failed/')).toBeVisible({ timeout: 5000 })

    // 여전히 로그인 페이지에 있는지 확인
    expect(page.url()).toContain('/auth/login')
  })
})
