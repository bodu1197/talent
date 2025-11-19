const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/orders/seller/route.ts',
  'src/app/api/user/service-favorites/route.ts',
  'src/app/chat/[roomId]/DirectChatClient.tsx',
  'src/app/mypage/seller/services/page.tsx',
  'src/app/mypage/seller/services/statistics/page.tsx',
  'src/app/page.tsx',
  'src/components/services/TemplateSelector.tsx',
  'src/lib/template-generator.ts',
  'src/lib/categories.ts',
  'src/lib/supabase/queries/admin.ts',
  'src/lib/supabase/queries/dashboard.ts',
  'src/lib/supabase/queries/search.ts',
  'src/lib/supabase/queries/services.ts'
];

let totalFixes = 0;

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix 1: Remove }); at end of for loops (should be just })
  // Look for pattern: any whitespace followed by }); at end of line
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // If line is exactly "});" or "  });" etc, check context
    if (trimmed === '});' || trimmed === '})') {
      // Look back to see if this might be a for loop closing
      let isForLoopClosing = false;
      for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
        if (lines[j].includes('for (const') || lines[j].includes('for (let')) {
          isForLoopClosing = true;
          break;
        }
        // If we hit a function or other structure, stop
        if (lines[j].includes('function') || lines[j].includes('=>') || lines[j].includes('.map(') || lines[j].includes('.forEach(')) {
          break;
        }
      }

      if (isForLoopClosing && trimmed === '});') {
        // Change to just }
        newLines.push(line.replace('});', '}'));
        console.log(`Fixed ${relPath}:${i + 1} - removed ; from for loop closing`);
        totalFixes++;
        continue;
      }
    }

    newLines.push(line);
  }

  content = newLines.join('\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${relPath}`);
  }
});

console.log(`\n📊 Total fixes: ${totalFixes}`);
