const fs = require('fs');
const path = require('path');

const files = [
  'src/app/mypage/seller/dashboard2/Dashboard2Client.tsx',
  'src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx',
  'src/app/mypage/seller/statistics/SellerStatisticsClient.tsx',
  'src/app/mypage/settings/edit/SettingsEditClient.tsx',
  'src/app/mypage/settings/SettingsClient.tsx',
  'src/app/payment/bank-transfer/[orderId]/BankTransferClient.tsx',
  'src/app/payment/direct/[orderId]/DirectPaymentClient.tsx',
];

console.log('='.repeat(80));
console.log('Fixing type Props with readonly');
console.log('='.repeat(80));
console.log();

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  NOT FOUND: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: type Props = { ... }
  content = content.replace(/(type\s+Props\s*=\s*\{[^}]+\})/g, (match) => {
    return match.replace(/^(\s+)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}`);
  } else {
    console.log(`⏭️  ${file} (no changes)`);
  }
});

console.log();
console.log('='.repeat(80));
console.log('Complete!');
