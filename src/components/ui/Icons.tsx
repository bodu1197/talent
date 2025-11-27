/**
 * 중앙 집중식 아이콘 관리 파일
 * lucide-react로 마이그레이션하여 번들 크기 최적화 (1.3MB → ~50KB)
 *
 * 사용법:
 * import { IconStar, IconCheck, IconX } from '@/components/ui/Icons';
 */

// lucide-react 아이콘 (트리쉐이킹 지원)
export {
  // 일반 액션
  X as IconX,
  Check as IconCheck,
  Plus as IconPlus,
  Minus as IconMinus,
  Edit as IconEdit,
  Pencil as IconPencil,
  Trash2 as IconTrash,
  Search as IconSearch,
  Filter as IconFilter,
  // 화살표/네비게이션
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
  ArrowUp as IconArrowUp,
  ArrowDown as IconArrowDown,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  ChevronUp as IconChevronUp,
  ChevronDown as IconChevronDown,
  ExternalLink as IconExternalLink,
  // 상태/피드백
  Star as IconStar,
  Heart as IconHeart,
  ThumbsUp as IconThumbsUp,
  ThumbsDown as IconThumbsDown,
  CheckCircle as IconCheckCircle,
  CheckCircle2 as IconCheckCircle2,
  XCircle as IconXCircle,
  AlertCircle as IconAlertCircle,
  AlertTriangle as IconAlertTriangle,
  Info as IconInfo,
  HelpCircle as IconHelpCircle,
  // 로딩
  Loader2 as IconSpinner,
  RefreshCw as IconRefresh,
  RotateCw as IconRedo,
  // 사용자/계정
  User as IconUser,
  Users as IconUsers,
  UserCircle as IconUserCircle,
  UserCheck as IconUserCheck,
  // 미디어
  Image as IconImage,
  Camera as IconCamera,
  Video as IconVideo,
  Play as IconPlay,
  Pause as IconPause,
  // 파일/문서
  File as IconFile,
  FileText as IconFileText,
  Folder as IconFolder,
  FolderOpen as IconFolderOpen,
  Download as IconDownload,
  Upload as IconUpload,
  CloudUpload as IconCloudUpload,
  // 커뮤니케이션
  Mail as IconMail,
  MessageCircle as IconMessageCircle,
  MessageSquare as IconMessageSquare,
  Send as IconSend,
  Bell as IconBell,
  BellOff as IconBellOff,
  Phone as IconPhone,
  // 커머스/금융
  ShoppingCart as IconShoppingCart,
  CreditCard as IconCreditCard,
  DollarSign as IconDollarSign,
  Wallet as IconWallet,
  Receipt as IconReceipt,
  Banknote as IconBanknote,
  Building as IconBuilding,
  Building2 as IconBank,
  // 시간/일정
  Clock as IconClock,
  Calendar as IconCalendar,
  CalendarCheck as IconCalendarCheck,
  History as IconHistory,
  // 설정/도구
  Settings as IconSettings,
  Cog as IconCog,
  Key as IconKey,
  Lock as IconLock,
  Unlock as IconUnlock,
  Shield as IconShield,
  // 차트/통계
  BarChart as IconBarChart,
  LineChart as IconLineChart,
  PieChart as IconPieChart,
  TrendingUp as IconTrendingUp,
  TrendingDown as IconTrendingDown,
  Activity as IconActivity,
  // 기타
  Eye as IconEye,
  EyeOff as IconEyeOff,
  Link as IconLink,
  Share2 as IconShare,
  Copy as IconCopy,
  Clipboard as IconClipboard,
  Flag as IconFlag,
  Bookmark as IconBookmark,
  Tag as IconTag,
  Hash as IconHash,
  Globe as IconGlobe,
  MapPin as IconMapPin,
  Compass as IconCompass,
  Zap as IconZap,
  Flame as IconFlame,
  Lightbulb as IconLightbulb,
  Sparkles as IconSparkles,
  Wand2 as IconWand,
  Bot as IconBot,
  // 레이아웃
  Menu as IconMenu,
  MoreHorizontal as IconMoreHorizontal,
  MoreVertical as IconMoreVertical,
  Grid as IconGrid,
  List as IconList,
  LayoutGrid as IconLayoutGrid,
  Maximize as IconMaximize,
  Minimize as IconMinimize,
  // 디바이스
  Monitor as IconMonitor,
  Smartphone as IconSmartphone,
  Tablet as IconTablet,
  Laptop as IconLaptop,
  // 브리프케이스/비즈니스
  Briefcase as IconBriefcase,
  Package as IconPackage,
  Box as IconBox,
  Inbox as IconInbox,
  Archive as IconArchive,
  // 소셜 (lucide에서 지원하는 것만)
  Youtube as IconYoutube,
  Github as IconGithub,
  Twitter as IconTwitter,
  Facebook as IconFacebook,
  Instagram as IconInstagram,
  Linkedin as IconLinkedin,
  // 특수 아이콘
  Printer as IconPrinter,
  Palette as IconPalette,
  Brush as IconBrush,
  Paintbrush as IconPaintbrush,
  Layers as IconLayers,
  FolderTree as IconFolderTree,
  Ban as IconBan,
  CircleDollarSign as IconCircleDollarSign,
  Coins as IconCoins,
  Reply as IconReply,
  Forward as IconForward,
  CornerDownLeft as IconCornerDownLeft,
  CornerDownRight as IconCornerDownRight,
  MessageCircleReply as IconMessageReply,
  ChartLine as IconChartLine,
  CircleCheck as IconCircleCheck,
  CircleX as IconCircleX,
  SquareCheck as IconSquareCheck,
  Square as IconSquare,
  // 추가 아이콘
  Expand as IconExpand,
  Shrink as IconShrink,
  Maximize2 as IconMaximize2,
  Minimize2 as IconMinimize2,
  Move as IconMove,
  GripVertical as IconGripVertical,
  GripHorizontal as IconGripHorizontal,
} from 'lucide-react';

// lucide-react에서 outline 스타일 아이콘 사용
// (lucide-react는 기본이 outline 스타일이므로 별도 export 필요 없음)
// 사용 예: <Heart /> - outline, <Heart className="fill-current" /> - filled

// 아이콘 타입 (필요시 사용)
export type { LucideProps as IconProps } from 'lucide-react';
