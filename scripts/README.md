# Scripts 사용 가이드

이 폴더의 스크립트들은 Supabase 데이터베이스를 직접 조작하는 개발 도구입니다.

## 빠른 시작 (권장)

**한 번만 실행**하면 다음 세션에서도 자동으로 토큰이 설정됩니다:

```powershell
# PowerShell에서 실행 (관리자 권한 불필요)
.\setup-env.ps1
```

이제 터미널을 새로 열어도 바로 스크립트를 실행할 수 있습니다!

## 환경 변수 설정 (대안 방법)

위 방법이 안 되면 다음 방법을 사용하세요:

### 필수 환경 변수

```bash
# Supabase Management API 토큰
export SUPABASE_ACCESS_TOKEN=your_access_token

# Supabase 프로젝트 ID (선택사항, 기본값: abroivxthindezdtdzmj)
export SUPABASE_PROJECT_ID=your_project_id
```

### Windows (PowerShell)

```powershell
$env:SUPABASE_ACCESS_TOKEN="your_access_token"
$env:SUPABASE_PROJECT_ID="your_project_id"
```

### Windows (CMD)

```cmd
set SUPABASE_ACCESS_TOKEN=your_access_token
set SUPABASE_PROJECT_ID=your_project_id
```

## 토큰 얻는 방법

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. Settings → API → Project API keys → **Management API tokens** 섹션
3. "Generate new token" 클릭
4. 토큰 복사 (형식: `sbp_...`)

⚠️ **보안 주의사항**: 이 토큰은 절대 Git에 커밋하지 마세요!

## 스크립트 실행 예시

```bash
# 환경 변수 설정 후 스크립트 실행
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
node scripts/sync-knowledge-base.js
```

## 주요 스크립트

- `sync-knowledge-base.js` - AI 지식베이스 동기화
- `run-*-migration.js` - 데이터베이스 마이그레이션 실행
- `clean-*.js` - 데이터베이스 정리
- `apply-*.js` - 마이그레이션 적용
