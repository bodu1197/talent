const fs = require('fs');
const path = require('path');

// List of all files that were modified
const filesToFix = [
  'src/components/home/RecentViewedServices.tsx',
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/advertising/statistics/route.ts',
  'src/lib/supabase/queries/search.ts',
  'src/lib/supabase/queries/services.ts',
  'src/app/api/chat/messages/route.ts',
  'src/app/api/chat/rooms/route.ts',
  'src/app/api/orders/buyer/count/route.ts',
  'src/app/api/orders/seller/count/route.ts',
  'src/app/api/orders/seller/route.ts',
  'src/app/api/search/services/route.ts',
  'src/app/api/user/service-favorites/route.ts',
  'src/app/categories/[slug]/page.tsx',
  'src/app/chat/[roomId]/DirectChatClient.tsx',
  'src/app/mypage/seller/services/page.tsx',
  'src/app/mypage/seller/services/statistics/page.tsx',
  'src/app/page.tsx',
  'src/components/home/RecommendedServices.tsx',
  'src/components/mypage/Sidebar.tsx',
  'src/components/services/TemplateSelector.tsx',
  'src/components/services/TextOverlayEditor.tsx',
  'src/lib/categories.ts',
  'src/lib/supabase/queries/admin.ts',
  'src/lib/supabase/queries/category-visits.ts',
  'src/lib/supabase/queries/dashboard.ts',
  'src/lib/supabase/queries/personalized-services.ts',
  'src/lib/template-generator.ts',
];

let totalFixes = 0;
let filesModified = 0;

function fixClosingBraces(content) {
  let modified = content;
  let fixes = 0;

  // Fix: for...of loops shouldn't end with });  they should end with }
  // We look for patterns like:
  //   }
  //   });
  // or
  //   }
  //   })
  // And replace with just }

  // Pattern: closing brace on its own line followed by }); or })
  const pattern = /(\n\s*})\s*\n\s*}\)\s*;?/g;
  modified = modified.replace(pattern, (match, closingBrace) => {
    fixes++;
    return closingBrace;
  });

  return { content: modified, fixes };
}

filesToFix.forEach((relPath) => {
  const filePath = path.join(__dirname, relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relPath}`);
    return;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  const { content, fixes } = fixClosingBraces(originalContent);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalFixes += fixes;
    console.log(`✅ Fixed ${relPath} (${fixes} closing braces)`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files fixed: ${filesModified}`);
console.log(`   Total closing braces fixed: ${totalFixes}`);
