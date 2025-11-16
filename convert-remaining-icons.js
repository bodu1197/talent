const fs = require("fs");
const path = require("path");

// 남은 파일 목록
const remainingFiles = [
  "src/app/mypage/seller/orders/[id]/SellerOrderDetailClient.tsx",
  "src/app/mypage/buyer/dashboard/BuyerDashboardClient.tsx",
  "src/app/mypage/buyer/orders/page.tsx",
  "src/app/mypage/buyer/orders/[id]/page.tsx",
  "src/app/mypage/buyer/reviews/BuyerReviewsClient.tsx",
  "src/app/payment/direct/[orderId]/DirectPaymentClient.tsx",
  "src/app/mypage/settings/SettingsClient.tsx",
  "src/app/mypage/settings/edit/SettingsEditClient.tsx",
  "src/app/mypage/seller/register/SellerRegisterClient.tsx",
  "src/app/chat/ChatListClient.tsx",
  "src/app/mypage/seller/services/new/NewServiceClient.tsx",
  "src/app/mypage/seller/services/new/steps/Step1BasicInfo.tsx",
  "src/app/mypage/seller/services/new/steps/Step3Description.tsx",
  "src/app/mypage/seller/services/new/steps/Step4Images.tsx",
  "src/app/mypage/seller/services/new/steps/Step5Requirements.tsx",
  "src/app/mypage/seller/services/[id]/edit/EditServiceClient.tsx",
  "src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx",
  "src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx",
  "src/app/mypage/seller/portfolio/[id]/PortfolioDetailClient.tsx",
  "src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx",
  "src/app/mypage/seller/advertising/page.tsx",
  "src/app/mypage/seller/advertising/charge/page.tsx",
  "src/app/mypage/seller/advertising/payments/[id]/page.tsx",
  "src/components/services/TextOverlayEditor.tsx",
  "src/app/admin/dashboard/page.tsx",
  "src/app/admin/services/page.tsx",
  "src/app/admin/services/pending/[id]/PendingServiceDetailClient.tsx",
  "src/app/admin/services/revisions/[id]/RevisionDetailClient.tsx",
  "src/app/admin/service-revisions/page.tsx",
  "src/app/admin/orders/page.tsx",
  "src/app/admin/reviews/page.tsx",
  "src/app/admin/users/page.tsx",
  "src/app/admin/tax-invoices/page.tsx",
  "src/app/admin/advertising/page.tsx",
];

// Font Awesome 아이콘을 react-icons로 매핑
const iconMap = {
  // Navigation
  "fa-home": "FaHome",
  "fa-arrow-left": "FaArrowLeft",
  "fa-arrow-right": "FaArrowRight",
  "fa-chevron-left": "FaChevronLeft",
  "fa-chevron-right": "FaChevronRight",
  "fa-chevron-down": "FaChevronDown",
  "fa-chevron-up": "FaChevronUp",

  // User
  "fa-user": "FaUser",
  "fa-user-circle": "FaUserCircle",
  "fa-users": "FaUsers",

  // Actions
  "fa-edit": "FaEdit",
  "fa-trash": "FaTrash",
  "fa-trash-alt": "FaTrashAlt",
  "fa-save": "FaSave",
  "fa-plus": "FaPlus",
  "fa-minus": "FaMinus",
  "fa-times": "FaTimes",
  "fa-check": "FaCheck",
  "fa-copy": "FaCopy",
  "fa-download": "FaDownload",
  "fa-upload": "FaUpload",
  "fa-redo": "FaRedo",
  "fa-redo-alt": "FaRedoAlt",

  // Content
  "fa-image": "FaImage",
  "fa-file": "FaFile",
  "fa-file-alt": "FaFileAlt",
  "fa-folder": "FaFolder",
  "fa-video": "FaVideo",

  // Status
  "fa-check-circle": "FaCheckCircle",
  "fa-times-circle": "FaTimesCircle",
  "fa-exclamation-circle": "FaExclamationCircle",
  "fa-info-circle": "FaInfoCircle",
  "fa-question-circle": "FaQuestionCircle",
  "fa-clock": "FaClock",
  "fa-hourglass-half": "FaHourglassHalf",
  "fa-spinner": "FaSpinner",
  "fa-ban": "FaBan",

  // Communication
  "fa-comment": "FaComment",
  "fa-comments": "FaComments",
  "fa-envelope": "FaEnvelope",
  "fa-phone": "FaPhone",
  "fa-bell": "FaBell",

  // Business
  "fa-shopping-cart": "FaShoppingCart",
  "fa-box": "FaBox",
  "fa-briefcase": "FaBriefcase",
  "fa-dollar-sign": "FaDollarSign",
  "fa-chart-line": "FaChartLine",
  "fa-chart-bar": "FaChartBar",

  // Media
  "fa-play": "FaPlay",
  "fa-pause": "FaPause",
  "fa-eye": "FaEye",
  "fa-eye-slash": "FaEyeSlash",

  // Favorites
  "fa-heart": "FaHeart",
  "fa-star": "FaStar",

  // Other
  "fa-search": "FaSearch",
  "fa-cog": "FaCog",
  "fa-bars": "FaBars",
  "fa-calendar": "FaCalendar",
  "fa-sign-out-alt": "FaSignOutAlt",
  "fa-inbox": "FaInbox",
  "fa-robot": "FaRobot",
  "fa-fire": "FaFire",
  "fa-cloud-upload-alt": "FaCloudUploadAlt",
  "fa-headset": "FaHeadset",

  // Additional icons
  "fa-exclamation-triangle": "FaExclamationTriangle",
  "fa-reply": "FaReply",
  "fa-credit-card": "FaCreditCard",
  "fa-university": "FaUniversity",
  "fa-key": "FaKey",
  "fa-camera": "FaCamera",
  "fa-paperclip": "FaPaperclip",
  "fa-palette": "FaPalette",
  "fa-wand-magic-sparkles": "FaWandMagicSparkles",
  "fa-folder-tree": "FaFolder",
  "fa-lightbulb": "FaLightbulb",
  "fa-youtube": "FaYoutube",
  "fa-undo": "FaUndo",
  "fa-sack-dollar": "FaSackDollar",
  "fa-external-link-alt": "FaExternalLinkAlt",
  "fa-gift": "FaGift",
  "fa-mouse-pointer": "FaMousePointer",
  "fa-bullhorn": "FaBullhorn",
  "fa-list": "FaList",
  "fa-tag": "FaTag",
  "fa-rocket": "FaRocket",
  "fa-text": "FaFont",
  "fa-keyboard": "FaKeyboard",
  "fa-location-dot": "FaMapMarkerAlt",
  "fa-text-height": "FaTextHeight",
  "fa-bold": "FaBold",
  "fa-circle-half-stroke": "FaAdjust",
  "fa-won-sign": "FaWonSign",
  "fa-flag": "FaFlag",
  "fa-file-invoice": "FaFileInvoice",
  "fa-calendar-check": "FaCalendarCheck",
  "fa-money-bill-wave": "FaMoneyBillWave",
};

// Regular 아이콘 매핑
const regularIconMap = {
  "fa-heart": "FaRegHeart",
  "fa-star": "FaRegStar",
  "fa-bell": "FaRegBell",
  "fa-comment": "FaRegComment",
  "fa-comments": "FaRegComments",
};

function convertFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  const originalContent = content;

  // 사용된 아이콘 추적
  const usedIcons = new Set();
  const usedRegularIcons = new Set();

  // <i className="fa..."> 패턴 찾기
  const iconPattern =
    /<i\s+className=["']([^"']*\b(?:fa|far|fas)\b[^"']*)["']([^>]*)>/g;

  let match;
  while ((match = iconPattern.exec(content)) !== null) {
    const classes = match[1];
    const otherAttrs = match[2];

    // far (regular) vs fas (solid) 구분
    const isRegular = classes.includes("far");

    // fa-로 시작하는 아이콘 이름 추출
    const iconNameMatch = classes.match(/\bfa-([\w-]+)/);
    if (!iconNameMatch) continue;

    const iconName = "fa-" + iconNameMatch[1];
    let reactIconName;

    // Regular vs Solid 결정
    if (isRegular && regularIconMap[iconName]) {
      reactIconName = regularIconMap[iconName];
      usedRegularIcons.add(reactIconName);
    } else if (iconMap[iconName]) {
      reactIconName = iconMap[iconName];
      usedIcons.add(reactIconName);
    } else {
      console.log(`⚠️  Unknown icon: ${iconName} in ${filePath}`);
      continue;
    }

    // Tailwind 클래스나 다른 클래스 추출
    const otherClasses = classes
      .replace(/\b(?:fa|far|fas)\b/g, "")
      .replace(/\bfa-[\w-]+\b/g, "")
      .trim();

    // React 컴포넌트로 변환
    let replacement = `<${reactIconName}`;

    if (otherClasses) {
      replacement += ` className="${otherClasses}"`;
    }

    replacement += otherAttrs + " />";

    // 원본을 replacement로 교체
    content = content.replace(match[0], replacement);
  }

  // import 문 추가
  if (usedIcons.size > 0 || usedRegularIcons.size > 0) {
    const allIcons = [...usedIcons, ...usedRegularIcons].sort();
    const importStatement = `import { ${allIcons.join(", ")} } from 'react-icons/fa';\n`;

    // 기존 import 문 뒤에 추가
    const importMatch = content.match(/^(import.*\n)+/m);
    if (importMatch) {
      const lastImportIndex = importMatch[0].lastIndexOf("\n");
      content =
        content.slice(0, importMatch.index + lastImportIndex + 1) +
        importStatement +
        content.slice(importMatch.index + lastImportIndex + 1);
    } else {
      content = importStatement + content;
    }

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, "utf8");
      console.log(`✅ Converted ${filePath} (${allIcons.length} icons)`);
      return true;
    }
  }

  console.log(`⏭️  Skipped ${filePath} (no icons found)`);
  return false;
}

// 모든 파일 변환
let converted = 0;
let skipped = 0;

console.log("🚀 Starting icon conversion...\n");

remainingFiles.forEach((file) => {
  if (convertFile(file)) {
    converted++;
  } else {
    skipped++;
  }
});

console.log(`\n✅ Conversion complete!`);
console.log(`   Converted: ${converted} files`);
console.log(`   Skipped: ${skipped} files`);
console.log(`   Total: ${converted + skipped} files`);
