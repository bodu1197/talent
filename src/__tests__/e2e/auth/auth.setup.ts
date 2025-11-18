import { test as setup } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate as admin', async ({ page }) => {
  // 로그인 페이지로 이동
  await page.goto('/auth/login')

  // 로그인 폼 입력
  await page.fill('input[name="email"]', 'ohyus1197@gmail.com')
  await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || '')

  // 로그인 버튼 클릭
  await page.click('button[type="submit"]')

  // 로그인 완료 대기 - 마이페이지 또는 대시보드로 리디렉션됨
  await page.waitForURL(/\/(mypage|admin)/)

  // 인증 상태 저장
  await page.context().storageState({ path: authFile })
})
