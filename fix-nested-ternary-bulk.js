const fs = require("fs");
const path = require("path");

// S3358 Nested Ternary 수정 스크립트
// 목표: 중첩 삼항 연산자를 if/else 헬퍼 함수로 변환

const issues = JSON.parse(
  fs.readFileSync("s3358-nested-ternary.json", "utf-8"),
);

console.log(
  `총 ${issues.issues.length}개의 S3358 nested ternary issues 발견\n`,
);

// 이미 수정된 파일들 (수동 처리)
const fixedFiles = [
  "src/components/layout/Header.tsx",
  "src/components/services/PortfolioModal.tsx",
  "src/app/mypage/seller/dashboard/SellerDashboardClient.tsx",
];

// 파일별로 그룹화
const byFile = {};
issues.issues.forEach((issue) => {
  const file = issue.component.replace("talent:", "");
  if (!byFile[file]) byFile[file] = [];
  if (issue.line) {
    // line number가 있는 경우만
    byFile[file].push({
      line: issue.line,
      message: issue.message,
    });
  }
});

console.log("처리 대상 파일:");
console.log("=================\n");

let totalRemaining = 0;
Object.entries(byFile)
  .filter(([file]) => !fixedFiles.includes(file))
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([file, issueList]) => {
    console.log(`${file} (${issueList.length}개)`);
    issueList.forEach((issue) => {
      console.log(`  Line ${issue.line}: ${issue.message}`);
    });
    totalRemaining += issueList.length;
  });

console.log(`\n남은 issues: ${totalRemaining}개`);
console.log(`\n이미 수정됨: ${fixedFiles.length}개 파일`);
fixedFiles.forEach((f) => console.log(`  ✓ ${f}`));

// 다음 처리할 파일 우선순위
console.log("\n\n다음 처리 우선순위:");
console.log("==================");
const remaining = Object.entries(byFile)
  .filter(([file]) => !fixedFiles.includes(file))
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5);

remaining.forEach(([file, issueList], idx) => {
  console.log(`${idx + 1}. ${file} (${issueList.length}개 issues)`);
});
