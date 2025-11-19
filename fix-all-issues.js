const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/mypage/seller/services/page.tsx',
  'src/app/page.tsx',
  'src/components/home/RecommendedServices.tsx',
  'src/lib/supabase/queries/admin.ts',
  'src/lib/supabase/queries/personalized-services.ts',
  'src/lib/supabase/queries/search.ts',
  'src/lib/supabase/queries/services.ts',
  'src/lib/template-generator.ts',
  'src/lib/supabase/queries/dashboard.ts',
  'src/lib/supabase/queries/category-visits.ts',
  'src/app/categories/[slug]/page.tsx',
  'src/app/chat/[roomId]/DirectChatClient.tsx',
  'src/app/mypage/seller/services/statistics/page.tsx',
  'src/components/mypage/Sidebar.tsx',
  'src/components/services/TemplateSelector.tsx',
  'src/components/services/TextOverlayEditor.tsx',
  'src/lib/categories.ts',
  'src/app/api/user/service-favorites/route.ts'
];

let totalFixes = 0;
let filesModified = 0;

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);

  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;

  // Fix 1: Remove type annotations from for...of loops
  // Pattern: for (const var: Type of array)
  const typeAnnotationPattern = /for\s*\(\s*const\s+(\w+)\s*:\s*[^=]+ of\s/g;
  content = content.replace(typeAnnotationPattern, (match, varName) => {
    fixes++;
    return `for (const ${varName} of `;
  });

  // Fix 2: Fix incorrect .for replacements (should be for...of)
  // Pattern: something.for (const var of array)
  const incorrectForPattern = /(\w+)\.for\s*\(\s*const\s+(\w+)(?:\s*,\s*(\w+))?\s+of\s+([^)]+)\)/g;
  content = content.replace(incorrectForPattern, (match, obj, var1, var2, array) => {
    fixes++;
    if (var2) {
      // Pattern like: template.for (const color, index of colors)
      return `for (const [${var2}, ${var1}] of ${obj}.${array}.entries())`;
    }
    return `for (const ${var1} of ${obj}.${array})`;
  });

  // Fix 3: Remove trailing }); that should just be }
  // Only if they appear after a for...of loop closing brace
  const trailingBracePattern = /(\n\s+})\s*\n\s*}\);?\s*$/gm;
  content = content.replace(trailingBracePattern, '$1');

  // Fix 4: Fix missing closing braces after for loops
  // Look for patterns like:
  //     }
  //   export function
  // And add the missing }
  const missingBracePattern = /(\n\s+})\s*\n\s*(export\s+(?:async\s+)?function)/g;
  content = content.replace(missingBracePattern, '$1\n}\n\n$2');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalFixes += fixes;
    console.log(`✅ Fixed ${relPath} (${fixes} fixes)`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total fixes: ${totalFixes}`);
