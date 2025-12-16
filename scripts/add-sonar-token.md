# SonarCloud 토큰 GitHub Secret 추가 가이드

## 자동 추가 (권장)

GitHub Secrets 페이지가 이미 열려 있습니다:
https://github.com/bodu1197/talent/settings/secrets/actions

### 단계별 진행:

1. **New repository secret** 버튼 클릭

2. Secret 정보 입력:
   - **Name**: `SONAR_TOKEN`
   - **Secret**: `f8cf9d9a7090bb397be795f04e61653cf8003c43`

3. **Add secret** 버튼 클릭

## 완료 후

토큰이 추가되면 자동으로 다음이 실행됩니다:

- 다음 git push 시 GitHub Actions가 SonarCloud 분석 실행
- Phase 6 수정 사항이 SonarCloud에 반영
- 279개 → 약 60-80개 이슈로 감소 예상

## 확인 방법

```bash
# 새로운 커밋을 push
git commit --allow-empty -m "test: trigger SonarCloud analysis"
git push origin master
```

그 후 다음 URL에서 분석 진행 확인:

- GitHub Actions: https://github.com/bodu1197/talent/actions
- SonarCloud: https://sonarcloud.io/project/overview?id=bodu1197_talent
