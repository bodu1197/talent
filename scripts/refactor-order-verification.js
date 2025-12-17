const fs = require('fs');
const path = require('path');

// Files to update with verifyOrderBuyer
const buyerOnlyFiles = [
  'src/app/api/orders/[id]/cancel/route.ts',
  'src/app/api/orders/[id]/confirm/route.ts',
  'src/app/api/orders/[id]/revision/route.ts',
];

// Update each file
for (const filePath of buyerOnlyFiles) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not present
  if (!content.includes('verifyOrderBuyer')) {
    content = content.replace(
      /import { requireAuth } from '@\/lib\/api\/auth';/,
      `import { requireAuth } from '@/lib/api/auth';\nimport { verifyOrderBuyer } from '@/lib/api/ownership';`
    );
  }

  // Replace the duplicated order verification pattern
  content = content.replace(
    /\/\/ 주문 조회[\s\S]*?const { data: order, error: (?:fetchError|orderError) } = await supabase[\s\S]*?\.from\('orders'\)[\s\S]*?\.select\('\*'\)[\s\S]*?\.eq\('id', (?:id|orderId)\)[\s\S]*?\.single\(\);[\s\S]*?if \((?:fetchError|orderError) \|\| !order\) {[\s\S]*?return NextResponse\.json\({ error: '주문을 찾을 수 없습니다' }, { status: 404 }\);[\s\S]*?}[\s\S]*?\/\/ 구매자.*?확인[\s\S]*?if \(order\.buyer_id !== user\.id\) {[\s\S]*?return NextResponse\.json\({ error: .*? }, { status: 403 }\);[\s\S]*?}/,
    `// 주문 조회 및 구매자 권한 확인
    const orderResult = await verifyOrderBuyer(supabase, id, user.id);
    if (!orderResult.success) {
      return orderResult.error!;
    }

    const order = orderResult.data!.order;`
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

console.log('Refactoring complete!');
