/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fs = require('fs');
const path = require('path');

// Read the full list
const fileList = fs.readFileSync(path.join(__dirname, '..', 'readonly_props_files.txt'), 'utf8');
const allFiles = fileList.trim().split('\n');

// Already fixed (manually + batch 1)
const fixed = [
  'src/components/common/LoadingSpinner.tsx',
  'src/components/common/EmptyState.tsx',
  'src/components/common/ErrorState.tsx',
  'src/components/common/ProfileImage.tsx',
  'src/components/services/ContactSellerButton.tsx',
  'src/components/services/ExpertResponseBanner.tsx',
  'src/components/services/FavoriteButton.tsx',
  'src/components/services/PortfolioGrid.tsx',
  'src/components/services/PurchaseButton.tsx',
  'src/components/services/ServiceGrid.tsx',
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
];

// Remaining files
const remaining = allFiles.filter((f) => !fixed.includes(f));

console.log('='.repeat(80));
console.log('Fixing Remaining Readonly Props');
console.log('='.repeat(80));
console.log();
console.log(`Total files: ${allFiles.length}`);
console.log(`Already fixed: ${fixed.length}`);
console.log(`Remaining: ${remaining.length}`);
console.log();

let successCount = 0;
let skipCount = 0;

remaining.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  NOT FOUND: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Pattern 1: interface XxxProps { ... }
  content = content.replace(/(interface\s+\w+Props?\s*\{[^}]+\})/g, (match) => {
    return match.replace(/^(\s+)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
  });

  // Pattern 2: Inline props { prop: type }
  // Match function definitions with inline props
  content = content.replace(
    /(function\s+\w+\([^)]*:\s*\{)([^}]+)(\}[^)]*\))/g,
    (match, before, props, after) => {
      const fixedProps = props.replace(/^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
      return before + fixedProps + after;
    }
  );

  // Pattern 3: async function with inline props
  content = content.replace(
    /(async\s+function\s+\w+\([^)]*:\s*\{)([^}]+)(\}[^)]*\))/g,
    (match, before, props, after) => {
      const fixedProps = props.replace(/^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
      return before + fixedProps + after;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}`);
    successCount++;
  } else {
    console.log(`⏭️  ${file} (no changes)`);
    skipCount++;
  }
});

console.log();
console.log('='.repeat(80));
console.log(`✅ Fixed: ${successCount}`);
console.log(`⏭️  Skipped: ${skipCount}`);
console.log('='.repeat(80));
