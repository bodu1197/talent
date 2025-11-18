const fs = require("fs");
const path = require("path");

// Load S7728 issues
const issuesData = JSON.parse(fs.readFileSync("s7728-foreach.json", "utf8"));

// 간단한 regex 기반 안전한 변환
// forEach((param) => { 또는 forEach(param => { 패턴만 처리
function convertForEach(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // Pattern 1: .forEach((param) => {
  // Pattern 2: .forEach(param => {
  // 중요: 한 줄에 forEach 전체가 있는 경우만 처리

  // 멀티라인 forEach는 수동 처리 필요
  const lines = content.split("\n");
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 간단한 패턴만: array.forEach((param) => {
    const match = line.match(/^(\s*)(\S+?)\.forEach\(\(([^)]+)\)\s*=>\s*\{$/);
    if (match) {
      const [, indent, arrayExpr, param] = match;

      if (arrayExpr.endsWith("?")) {
        // Optional chaining은 스킵 (수동 처리)
        continue;
      }

      // 다음 라인들을 읽어서 닫는 괄호 찾기
      let depth = 1;
      let endIdx = -1;

      for (let j = i + 1; j < lines.length; j++) {
        for (const char of lines[j]) {
          if (char === "{") depth++;
          if (char === "}") depth--;
          if (depth === 0) {
            endIdx = j;
            break;
          }
        }
        if (endIdx !== -1) break;
      }

      if (endIdx === -1) continue; // 닫는 괄호 못 찾음

      // 변환
      lines[i] = `${indent}for (const ${param} of ${arrayExpr}) {`;

      // 마지막 라인 확인: })가 아니라 }만 있어야 함
      if (lines[endIdx].trim() === "})") {
        lines[endIdx] = lines[endIdx].replace("})", "}");
      }

      modified = true;
    }
  }

  if (modified) {
    content = lines.join("\n");
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }

  return false;
}

// 파일별로 처리
const fileIssues = {};
issuesData.issues.forEach((issue) => {
  const filePath = issue.component.replace("talent:", "");
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push(issue.line);
});

let totalConverted = 0;
const failedFiles = [];

console.log("🔧 Safe forEach to for...of conversion\n");

Object.keys(fileIssues).forEach((relPath) => {
  const fullPath = path.join(process.cwd(), relPath);

  try {
    const converted = convertForEach(fullPath);
    if (converted) {
      console.log(`✅ ${relPath}`);
      totalConverted++;
    } else {
      console.log(`⚠️  ${relPath} - 수동 처리 필요`);
      failedFiles.push(relPath);
    }
  } catch (error) {
    console.log(`❌ ${relPath} - ${error.message}`);
    failedFiles.push(relPath);
  }
});

console.log(`\n📊 Summary:`);
console.log(`Converted: ${totalConverted} files`);
console.log(`Manual needed: ${failedFiles.length} files`);

if (failedFiles.length > 0) {
  console.log("\n수동 처리 필요 파일:");
  failedFiles.forEach((f) => console.log(`  - ${f}`));
}
