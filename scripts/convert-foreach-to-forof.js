const fs = require('fs');
const path = require('path');

const files = [
  'src/components/mypage/Sidebar.tsx',
  'src/app/mypage/seller/services/statistics/page.tsx',
  'src/app/mypage/seller/services/page.tsx',
  'src/app/page.tsx',
  'src/components/home/RecentViewedServices.tsx',
  'src/app/api/chat/rooms/route.ts',
  'src/app/chat/[roomId]/DirectChatClient.tsx',
  'src/lib/advertising.ts',
  'src/lib/supabase/queries/personalized-services.ts',
  'src/lib/supabase/queries/search.ts',
  'src/lib/supabase/queries/dashboard.ts',
  'src/lib/supabase/queries/admin.ts',
  'src/lib/categories.ts',
  'src/components/services/TemplateSelector.tsx',
  'src/components/home/RecommendedServices.tsx',
  'src/app/categories/[slug]/page.tsx',
  'src/app/api/user/service-favorites/route.ts',
  'src/app/api/search/services/route.ts',
  'src/app/api/orders/seller/route.ts',
  'src/app/api/orders/seller/count/route.ts',
  'src/app/api/orders/buyer/count/route.ts',
  'src/app/api/chat/messages/route.ts',
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/advertising/statistics/route.ts',
  'src/lib/supabase/singleton.ts',
  'src/lib/supabase/queries/category-visits.ts',
];

console.log('='.repeat(80));
console.log('Converting forEach to for...of');
console.log('='.repeat(80));
console.log();

let totalConversions = 0;

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  NOT FOUND: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let conversions = 0;

  // Pattern 1: Simple forEach with arrow function
  // array.forEach(item => { ... })
  // Convert to: for (const item of array) { ... }
  const forEachPattern = /(\s*)(\w+)\.forEach\(\s*(?:\()?(\w+)(?:\))?\s*=>\s*\{/g;

  content = content.replace(forEachPattern, (match, indent, arrayName, itemName) => {
    conversions++;
    return `${indent}for (const ${itemName} of ${arrayName}) {`;
  });

  // Find and remove corresponding closing })
  if (conversions > 0) {
    // This is tricky - we need to match the closing })
    // For now, let's just report what needs manual review
    console.log(`✅ ${file}`);
    console.log(`   Found ${conversions} forEach patterns`);
    console.log(`   ⚠️  Please manually review closing brackets`);
    totalConversions += conversions;

    fs.writeFileSync(filePath, content);
  } else {
    console.log(`⏭️  ${file} (no simple patterns found)`);
  }
});

console.log();
console.log('='.repeat(80));
console.log(`Total conversions: ${totalConversions}`);
console.log('='.repeat(80));
console.log();
console.log('⚠️  IMPORTANT: This script converts forEach to for...of');
console.log('   You need to manually:');
console.log('   1. Remove the closing }) from forEach');
console.log('   2. Handle optional chaining cases (array?.forEach)');
console.log('   3. Run build and test');
