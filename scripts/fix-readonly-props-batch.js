const fs = require('fs');
const path = require('path');

// Files to process
const files = [
  'src/components/categories/CategoryFilter.tsx',
  'src/components/categories/CategorySidebar.tsx',
  'src/components/categories/CategorySort.tsx',
  'src/components/layout/ConditionalMegaMenu.tsx',
  'src/components/layout/MegaMenu.tsx',
  'src/components/layout/MobileSubHeader.tsx',
  'src/components/mypage/MobileSidebar.tsx',
  'src/components/mypage/MypageLayoutWrapper.tsx',
  'src/components/mypage/OrderCard.tsx',
  'src/components/mypage/Sidebar.tsx',
  'src/components/mypage/StatCard.tsx',
  'src/components/home/AITalentShowcase.tsx',
  'src/components/home/CategoryGridClient.tsx',
];

console.log('='.repeat(80));
console.log('Fixing Readonly Props - Batch Processing');
console.log('='.repeat(80));
console.log();

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Pattern 1: interface ... { prop: type; }
  // Match interface blocks and add readonly to each property
  content = content.replace(/(interface\s+\w+Props?\s*\{[^}]+\})/g, (match) => {
    // Add readonly to each property line
    return match.replace(/^(\s+)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
  });

  // Pattern 2: Inline props type { prop: type }
  // This is trickier, we'll handle manually

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ FIXED: ${file}`);
  } else {
    console.log(`⏭️  SKIP: ${file} (no changes needed)`);
  }
});

console.log();
console.log('='.repeat(80));
console.log('Batch processing complete!');
