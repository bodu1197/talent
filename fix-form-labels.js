const fs = require("fs");
const path = require("path");

// Load S6853 issues
const issues = JSON.parse(fs.readFileSync("s6853-issues.json", "utf-8"));

// Group by file
const byFile = {};
issues.forEach((issue) => {
  const file = issue.component.split(":")[1];
  if (!byFile[file]) {
    byFile[file] = [];
  }
  byFile[file].push(issue);
});

console.log(
  `\n=== Processing ${issues.length} Form Label Issues in ${Object.keys(byFile).length} files ===\n`,
);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

Object.keys(byFile)
  .sort()
  .forEach((filePath, fileIndex) => {
    const fullPath = path.join("C:\\Users\\ohyus\\talent", filePath);

    // Skip already fixed files
    if (
      filePath.includes("BecomeSellerForm.tsx") ||
      filePath.includes("WithdrawClient.tsx")
    ) {
      console.log(`${fileIndex + 1}. SKIP: ${filePath} (already fixed)`);
      skipCount += byFile[filePath].length;
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");
      const fileIssues = byFile[filePath].sort(
        (a, b) => (b.line || 0) - (a.line || 0),
      ); // Process from bottom to top

      let modifications = 0;

      fileIssues.forEach((issue, issueIdx) => {
        if (!issue.line) {
          console.log(`  ⚠️  Issue ${issueIdx + 1}: No line number`);
          return;
        }

        const lineNum = issue.line - 1; // 0-indexed
        const labelLine = lines[lineNum];

        if (!labelLine || !labelLine.includes("<label")) {
          console.log(`  ⚠️  Line ${issue.line}: Not a label line`);
          return;
        }

        // Find the next input/textarea/select within 15 lines
        let inputLineNum = -1;
        let inputType = "";

        for (
          let i = lineNum + 1;
          i < Math.min(lineNum + 15, lines.length);
          i++
        ) {
          const line = lines[i];
          if (
            line.includes("<input") ||
            line.includes("<textarea") ||
            line.includes("<select")
          ) {
            inputLineNum = i;
            if (line.includes("<input")) inputType = "input";
            else if (line.includes("<textarea")) inputType = "textarea";
            else inputType = "select";
            break;
          }
          // Stop if we hit another label or closing div
          if (line.includes("<label") || line.includes("</div>")) {
            break;
          }
        }

        if (inputLineNum === -1) {
          // This might be a display-only label, change to div
          console.log(
            `  📝 Line ${issue.line}: No input found, converting label to div`,
          );
          lines[lineNum] = labelLine.replace(
            /<label\s+className/,
            "<div className",
          );

          // Find closing </label> and replace with </div>
          for (let i = lineNum; i < Math.min(lineNum + 5, lines.length); i++) {
            if (lines[i].includes("</label>")) {
              lines[i] = lines[i].replace("</label>", "</div>");
              break;
            }
          }

          modifications++;
          return;
        }

        // Generate unique ID based on context
        const labelText = labelLine.match(/>\s*([^<]+)/)?.[1]?.trim() || "";
        const baseId = labelText
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/--+/g, "-")
          .substring(0, 30);

        const uniqueId = baseId + "-" + lineNum;

        // Check if already has htmlFor
        if (labelLine.includes("htmlFor=")) {
          console.log(`  ✓ Line ${issue.line}: Already has htmlFor`);
          return;
        }

        // Add htmlFor to label
        lines[lineNum] = labelLine.replace(
          /<label\s+className=/,
          `<label htmlFor="${uniqueId}" className=`,
        );

        // Add id to input (check if it already has id)
        const inputLine = lines[inputLineNum];
        if (!inputLine.includes(" id=")) {
          // Find where to insert id (after opening tag)
          const match = inputLine.match(/(<(?:input|textarea|select))/);
          if (match) {
            const insertPos = match.index + match[1].length;
            lines[inputLineNum] =
              inputLine.substring(0, insertPos) +
              `\n                id="${uniqueId}"` +
              inputLine.substring(insertPos);
          }
        }

        modifications++;
      });

      if (modifications > 0) {
        fs.writeFileSync(fullPath, lines.join("\n"), "utf-8");
        console.log(
          `${fileIndex + 1}. ✅ ${filePath} (${modifications} fixes)`,
        );
        successCount += modifications;
      } else {
        console.log(`${fileIndex + 1}. ⚠️  ${filePath} (no changes)`);
        skipCount += fileIssues.length;
      }
    } catch (error) {
      console.log(`${fileIndex + 1}. ❌ ${filePath} - ERROR: ${error.message}`);
      errorCount += byFile[filePath].length;
    }
  });

console.log(`\n=== Summary ===`);
console.log(`✅ Success: ${successCount}`);
console.log(`⚠️  Skipped: ${skipCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📊 Total: ${successCount + skipCount + errorCount}`);
