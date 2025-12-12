/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fs = require('fs');
const path = require('path');

const files = [
  {
    path: 'src/app/mypage/seller/dashboard/SellerDashboardClient.tsx',
    pattern: /^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm,
    inInterface: false,
  },
  {
    path: 'src/app/mypage/seller/dashboard2/Dashboard2Client.tsx',
    pattern: /^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm,
    inInterface: false,
  },
  {
    path: 'src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx',
    pattern: /^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm,
    inInterface: false,
  },
  {
    path: 'src/app/mypage/seller/statistics/SellerStatisticsClient.tsx',
    pattern: /^(\s*)([a-zA-Z_]\w*(\?)?:\s*)/gm,
    inInterface: false,
  },
  {
    path: 'src/app/mypage/settings/edit/SettingsEditClient.tsx',
    interface: 'Props',
    lines: [18, 24],
  },
  {
    path: 'src/app/mypage/settings/SettingsClient.tsx',
    interface: 'Props',
    lines: [16, 22],
  },
  {
    path: 'src/app/payment/bank-transfer/[orderId]/BankTransferClient.tsx',
    interface: 'Props',
    lines: [24, 28],
  },
  {
    path: 'src/app/payment/direct/[orderId]/DirectPaymentClient.tsx',
    interface: 'Props',
    lines: [45, 51],
  },
];

console.log('='.repeat(80));
console.log('Fixing Last 8 Readonly Props');
console.log('='.repeat(80));
console.log();

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file.path);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  NOT FOUND: ${file.path}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Add readonly to interface properties
  content = content.replace(/(interface\s+\w+Props?\s*\{[^}]+\})/g, (match) => {
    return match.replace(/^(\s+)([a-zA-Z_]\w*(\?)?:\s*)/gm, '$1readonly $2');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file.path}`);
  } else {
    console.log(`⏭️  ${file.path}`);
  }
});

console.log();
console.log('='.repeat(80));
console.log('Complete!');
