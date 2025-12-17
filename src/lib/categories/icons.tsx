/**
 * 카테고리 아이콘 매핑
 * 카테고리 아이콘 문자열을 Lucide React 컴포넌트로 변환
 */
import {
  Bot,
  Palette,
  Scissors,
  Code,
  Megaphone,
  Camera,
  Languages,
  PenTool,
  Briefcase,
  BookOpen,
  Music,
  Calendar,
  Sparkles,
  Target,
  Star,
  Library,
  Gavel,
  Hammer,
  GraduationCap,
  TrendingUp,
  Home,
  Bike,
  Activity,
  Circle,
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  robot: Bot,
  palette: Palette,
  scissors: Scissors,
  code: Code,
  bullhorn: Megaphone,
  camera: Camera,
  language: Languages,
  'pen-fancy': PenTool,
  briefcase: Briefcase,
  book: BookOpen,
  music: Music,
  calendar: Calendar,
  spa: Sparkles,
  bullseye: Target,
  star: Star,
  'book-open': Library,
  gavel: Gavel,
  hammer: Hammer,
  'graduation-cap': GraduationCap,
  'chart-line': TrendingUp,
  home: Home,
  motorcycle: Bike,
  running: Activity,
};

export function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  const IconComponent = (icon ? CATEGORY_ICON_MAP[icon] : undefined) ?? Circle;
  return <IconComponent className={className} />;
}
