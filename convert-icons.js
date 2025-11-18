const fs = require("fs");
const path = require("path");

// Recursive file search
function findFiles(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        findFiles(filePath, pattern, fileList);
      }
    } else if (file.match(pattern)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Font Awesome 아이콘 매핑 (fa- 접두사 제거 후 PascalCase)
const iconMap = {
  // Solid icons (fas, fa)
  star: "FaStar",
  user: "FaUser",
  heart: "FaHeart",
  search: "FaSearch",
  home: "FaHome",
  bell: "FaBell",
  box: "FaBox",
  "shopping-cart": "FaShoppingCart",
  cog: "FaCog",
  "sign-out-alt": "FaSignOutAlt",
  "chevron-down": "FaChevronDown",
  "chevron-up": "FaChevronUp",
  "chevron-left": "FaChevronLeft",
  "chevron-right": "FaChevronRight",
  "user-circle": "FaUserCircle",
  "check-circle": "FaCheckCircle",
  times: "FaTimes",
  "arrow-left": "FaArrowLeft",
  "arrow-right": "FaArrowRight",
  robot: "FaRobot",
  fire: "FaFire",
  edit: "FaEdit",
  trash: "FaTrash",
  plus: "FaPlus",
  minus: "FaMinus",
  check: "FaCheck",
  envelope: "FaEnvelope",
  phone: "FaPhone",
  comment: "FaComment",
  download: "FaDownload",
  upload: "FaUpload",
  image: "FaImage",
  video: "FaVideo",
  play: "FaPlay",
  pause: "FaPause",
  eye: "FaEye",
  "eye-slash": "FaEyeSlash",
  copy: "FaCopy",
  save: "FaSave",
  folder: "FaFolder",
  file: "FaFile",
  bars: "FaBars",
  close: "FaTimes",
  spinner: "FaSpinner",
  "info-circle": "FaInfoCircle",
  "exclamation-triangle": "FaExclamationTriangle",
  "question-circle": "FaQuestionCircle",
  "credit-card": "FaCreditCard",
  university: "FaUniversity",
  "money-bill-wave": "FaMoneyBillWave",
  "chart-line": "FaChartLine",
  lightbulb: "FaLightbulb",
  crown: "FaCrown",
  share: "FaShare",
  "shield-alt": "FaShieldAlt",
  reply: "FaReply",
  paperclip: "FaPaperclip",
  "paper-plane": "FaPaperPlane",
  "file-invoice-dollar": "FaFileInvoiceDollar",
  clock: "FaClock",
  redo: "FaRedo",
  "hourglass-half": "FaHourglassHalf",
  "map-marker-alt": "FaMapMarkerAlt",
  "location-arrow": "FaLocationArrow",
  users: "FaUsers",
  tags: "FaTags",
  rocket: "FaRocket",
  bullhorn: "FaBullhorn",
  comments: "FaComments",
  "shopping-bag": "FaShoppingBag",
  store: "FaStore",
  "mobile-alt": "FaMobileAlt",
  wallet: "FaWallet",
  lock: "FaLock",
  key: "FaKey",
  blog: "FaBlog",
  magic: "FaMagic",
  bolt: "FaBolt",
  "sad-tear": "FaSadTear",
  frown: "FaFrown",
  "times-circle": "FaTimesCircle",
  tired: "FaTired",
  "chart-line-down": "FaChartLineDown",
  "sad-cry": "FaSadCry",
  smile: "FaSmile",
  "sack-dollar": "FaSackDollar",
  "grin-stars": "FaGrinStars",
  sparkles: "FaSparkles",

  // Regular icons (far)
  "bell#far": "FaRegBell",
  "bell-slash#far": "FaRegBellSlash",
  "heart#far": "FaRegHeart",
  "comment#far": "FaRegComment",
  "user#far": "FaRegUser",
  "star#far": "FaRegStar",
  "comments#far": "FaRegComments",
};

// 파일 처리
function convertFile(filePath) {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // 사용된 아이콘 추적
  const usedIcons = new Set();

  // Regular icons 변환 (far fa-*)
  content = content.replace(
    /<i\s+className="far\s+fa-([a-z-]+)([^"]*)"([^>]*)><\/i>/gi,
    (match, iconName, extraClasses, attrs) => {
      const key = `${iconName}#far`;
      const componentName = iconMap[key];

      if (componentName) {
        usedIcons.add(componentName);
        const className = extraClasses.trim()
          ? ` className="${extraClasses.trim()}"`
          : "";
        return `<${componentName}${className}${attrs} />`;
      }
      return match;
    },
  );

  // Solid icons 변환 (fas fa-*, fa fa-*)
  content = content.replace(
    /<i\s+className="(fas|fa)\s+fa-([a-z-]+)([^"]*)"([^>]*)><\/i>/gi,
    (match, prefix, iconName, extraClasses, attrs) => {
      const componentName = iconMap[iconName];

      if (componentName) {
        usedIcons.add(componentName);
        const className = extraClasses.trim()
          ? ` className="${extraClasses.trim()}"`
          : "";
        return `<${componentName}${className}${attrs} />`;
      }
      return match;
    },
  );

  // import 추가
  if (usedIcons.size > 0) {
    const regularIcons = Array.from(usedIcons).filter((icon) =>
      icon.startsWith("FaReg"),
    );
    const solidIcons = Array.from(usedIcons).filter(
      (icon) => !icon.startsWith("FaReg"),
    );

    const imports = [];
    if (solidIcons.length > 0) {
      imports.push(
        `import { ${solidIcons.join(", ")} } from "react-icons/fa";`,
      );
    }
    if (regularIcons.length > 0) {
      imports.push(
        `import { ${regularIcons.join(", ")} } from "react-icons/fa";`,
      );
    }

    // import 삽입 위치 찾기 (마지막 import 다음)
    const lastImportMatch = content.match(/^import .+ from .+;$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertPos = content.indexOf(lastImport) + lastImport.length;
      content =
        content.slice(0, insertPos) +
        "\n" +
        imports.join("\n") +
        content.slice(insertPos);
    }
  }

  // 변경사항이 있으면 파일 저장
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  ✓ Converted (${usedIcons.size} icons)`);
    return true;
  } else {
    console.log(`  - No changes`);
    return false;
  }
}

// 모든 tsx/jsx 파일 찾기
const srcDir = path.join(__dirname, "src");
const files = findFiles(srcDir, /\.(tsx|jsx)$/);

let converted = 0;
let skipped = 0;

files.forEach((file) => {
  if (convertFile(file)) {
    converted++;
  } else {
    skipped++;
  }
});

console.log(`\n✓ Complete!`);
console.log(`  Converted: ${converted} files`);
console.log(`  Skipped: ${skipped} files`);
