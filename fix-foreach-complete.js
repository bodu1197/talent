const fs = require('fs');
const path = require('path');

// List of all files with forEach issues from SonarQube
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
  'src/lib/advertising.ts',
  'src/lib/categories.ts',
  'src/lib/supabase/queries/admin.ts',
  'src/lib/supabase/queries/category-visits.ts',
  'src/lib/supabase/queries/dashboard.ts',
  'src/lib/supabase/queries/personalized-services.ts',
  'src/lib/template-generator.ts',
];

let totalReplacements = 0;
let filesModified = 0;

function replaceForEachWithForOf(content) {
  let modified = content;
  let replacements = 0;

  // Pattern 1: Optional chaining with parentheses: array?.forEach((param) => {
  const optionalParens = /(\w+)\?\.forEach\(\s*\(([^)]+?)\)\s*=>\s*\{/g;
  modified = modified.replace(optionalParens, (match, array, param) => {
    replacements++;
    return `for (const ${param.trim()} of ${array} || []) {`;
  });

  // Pattern 2: Optional chaining without parentheses: array?.forEach(param => {
  const optionalNoParens = /(\w+)\?\.forEach\(\s*(\w+)\s*=>\s*\{/g;
  modified = modified.replace(optionalNoParens, (match, array, param) => {
    replacements++;
    return `for (const ${param.trim()} of ${array} || []) {`;
  });

  // Pattern 3: Regular with parentheses: array.forEach((param) => {
  const regularParens = /(\w+)\.forEach\(\s*\(([^)]+?)\)\s*=>\s*\{/g;
  modified = modified.replace(regularParens, (match, array, param) => {
    replacements++;
    return `for (const ${param.trim()} of ${array}) {`;
  });

  // Pattern 4: Regular without parentheses: array.forEach(param => {
  const regularNoParens = /(\w+)\.forEach\(\s*(\w+)\s*=>\s*\{/g;
  modified = modified.replace(regularNoParens, (match, array, param) => {
    replacements++;
    return `for (const ${param.trim()} of ${array}) {`;
  });

  // Pattern 5: Traditional function syntax: array.forEach(function(param) {
  const functionPattern = /(\w+)\.forEach\(\s*function\s*\(\s*([^)]+?)\s*\)\s*\{/g;
  modified = modified.replace(functionPattern, (match, array, param) => {
    replacements++;
    return `for (const ${param.trim()} of ${array}) {`;
  });

  return { content: modified, replacements };
}

filesToFix.forEach((relPath) => {
  const filePath = path.join(__dirname, relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relPath}`);
    return;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  const { content, replacements } = replaceForEachWithForOf(originalContent);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += replacements;
    console.log(`✅ Fixed ${relPath} (${replacements} replacements)`);
  } else {
    console.log(`ℹ️  No changes needed for ${relPath}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total .forEach() replaced: ${totalReplacements}`);
