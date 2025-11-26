const fs = require('fs');
const path = require('path');

const fixes = [
  // NewServiceClient.tsx - remaining label fixes
  {
    file: 'src/app/mypage/seller/services/new/NewServiceClient.tsx',
    replacements: [
      // Thumbnail label -> span
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*썸네일 이미지 \*\{" "\}/,
        to: '<span className="block text-sm font-medium text-gray-700 mb-2">\n                  썸네일 이미지 *{" "}'
      },
      {
        from: /\(권장: 652×488px\)\s*<\/span>\s*<\/label>/,
        to: '(권장: 652×488px)\n                  </span>\n                </span>'
      },
      // Service title label
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*서비스 제목 \*\s*<\/label>\s*<input\s*type="text"\s*value=\{formData\.title\}/,
        to: `<label
                  htmlFor="service-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  서비스 제목 *
                </label>
                <input
                  id="service-title"
                  type="text"
                  value={formData.title}`
      },
      // Category label -> span
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*카테고리 \*\s*<\/label>\s*<div className="space-y-3">/,
        to: `<span id="category-label" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </span>
                <div className="space-y-3" role="group" aria-labelledby="category-label">`
      },
      // Description label
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*서비스 설명 \*\s*<\/label>\s*<textarea\s*value=\{formData\.description\}/,
        to: `<label
                  htmlFor="service-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  서비스 설명 *
                </label>
                <textarea
                  id="service-description"
                  value={formData.description}`
      },
      // Search keywords label
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*검색 키워드\s*<\/label>\s*<input\s*type="text"\s*maxLength=\{100\}\s*value=\{formData\.searchKeywords\}/,
        to: `<label
                  htmlFor="search-keywords"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  검색 키워드
                </label>
                <input
                  id="search-keywords"
                  type="text"
                  maxLength={100}
                  value={formData.searchKeywords}`
      },
      // Price label
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*가격 \(원\) \*\s*<\/label>\s*<input\s*type="number"\s*min="1000"\s*max="10000000"\s*value=\{formData\.price\}/,
        to: `<label
                    htmlFor="service-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    가격 (원) *
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    min="1000"
                    max="10000000"
                    value={formData.price}`
      },
      // Delivery days label
      {
        from: /<label className="block text-sm font-medium text-gray-700 mb-2">\s*작업 기간 \(일\) \*\s*<\/label>\s*<input\s*type="number"\s*min="1"\s*max="365"\s*value=\{formData\.deliveryDays\}/,
        to: `<label
                    htmlFor="delivery-days"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    작업 기간 (일) *
                  </label>
                  <input
                    id="delivery-days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.deliveryDays}`
      }
    ]
  },
  // Props readonly fixes for various files
  {
    file: 'src/app/mypage/seller/earnings/SellerEarningsClient.tsx',
    replacements: [
      { from: /interface Props \{\s*earnings:/m, to: 'interface Props {\n  readonly earnings:' },
      { from: /interface Props \{\s*readonly earnings:[^}]+totalEarnings:/m, to: (match) => match.replace('totalEarnings:', 'readonly totalEarnings:') },
      { from: /interface Props \{\s*readonly earnings:[^}]+readonly totalEarnings:[^}]+pendingEarnings:/m, to: (match) => match.replace('pendingEarnings:', 'readonly pendingEarnings:') },
      { from: /interface Props \{\s*readonly earnings:[^}]+readonly totalEarnings:[^}]+readonly pendingEarnings:[^}]+availableEarnings:/m, to: (match) => match.replace('availableEarnings:', 'readonly availableEarnings:') }
    ]
  }
];

// Simple string replacements for common patterns
const simpleReplacements = {
  // Replace parseInt with Number.parseInt
  'src/app/mypage/seller/services/new/NewServiceClientV2.tsx': [
    { from: /parseInt\(/g, to: 'Number.parseInt(' }
  ],
  'src/app/mypage/seller/services/new/steps/Step2Pricing.tsx': [
    { from: /parseInt\(/g, to: 'Number.parseInt(' }
  ],
  'src/components/services/TextOverlayEditor.tsx': [
    { from: /parseInt\(/g, to: 'Number.parseInt(' }
  ],
  'src/lib/advertising.ts': [
    { from: /parseInt\(/g, to: 'Number.parseInt(' },
    { from: /\.replace\(\/\\s\+\/g,/g, to: '.replaceAll(/\\s+/g,' }
  ],
  // Replace String.match with RegExp.exec pattern
  'src/hooks/useYoutubeThumbnail.ts': [
    { from: /url\.match\(youtubeRegex\)/g, to: 'youtubeRegex.exec(url)' }
  ],
  // Replace .replace with .replaceAll where applicable
  'src/utils/format.ts': [
    { from: /\.replace\(\/\\s\+\/g,/g, to: '.replaceAll(/\\s+/g,' }
  ]
};

console.log('Fixing SonarQube issues...\n');

// Apply simple replacements
Object.entries(simpleReplacements).forEach(([filePath, replacements]) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
    }
  }
});

console.log('\nDone!');
