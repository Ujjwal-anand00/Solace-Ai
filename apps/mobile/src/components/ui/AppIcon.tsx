import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  Heart,
  Smile,
  Moon,
  Sun,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  User,
  Bell,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Shield,
  Activity,
  Compass,
  BookOpen,
  MessageCircle,
  Plus,
  Play,
  Pause,
  Volume2,
  Lock,
  Mail,
  Settings,
  Home,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Feather,
  Zap,
  TrendingUp,
  Award,
  Share2,
  Bookmark,
  PlayCircle,
  FileText,
  Phone,
  Star,
  Wind,
  Send,
  Copy,
  Trash2,
  History,
  LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export const ICON_MAP = {
  heart: Heart,
  smile: Smile,
  moon: Moon,
  sun: Sun,
  check: Check,
  x: X,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  search: Search,
  eye: Eye,
  eyeOff: EyeOff,
  sparkles: Sparkles,
  user: User,
  bell: Bell,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  info: Info,
  refreshCw: RefreshCw,
  shield: Shield,
  activity: Activity,
  compass: Compass,
  bookOpen: BookOpen,
  messageCircle: MessageCircle,
  plus: Plus,
  play: Play,
  pause: Pause,
  volume2: Volume2,
  lock: Lock,
  mail: Mail,
  settings: Settings,
  home: Home,
  sliders: Sliders,
  checkCircle: CheckCircle2,
  'check-circle': CheckCircle2,
  xCircle: XCircle,
  clock: Clock,
  calendar: Calendar,
  feather: Feather,
  zap: Zap,
  wind: Wind,
  trendingUp: TrendingUp,
  'trending-up': TrendingUp,
  'trend-up': TrendingUp,
  award: Award,
  share: Share2,
  'share-2': Share2,
  bookmark: Bookmark,
  'play-circle': PlayCircle,
  'file-text': FileText,
  phone: Phone,
  star: Star,
  send: Send,
  copy: Copy,
  trash: Trash2,
  history: History,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'message-circle': MessageCircle,
  'refresh-cw': RefreshCw,
  'book-open': BookOpen,
} as const;

export type IconName = keyof typeof ICON_MAP;

export interface AppIconProps {
  name: IconName | LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  strokeWidth?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  color,
  strokeWidth = 2,
  accessibilityLabel,
  style,
}) => {
  const { colors, layout } = useTheme();

  const resolvedSize = React.useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return layout.iconXs; // 16
      case 'sm':
        return layout.iconSm; // 20
      case 'md':
        return layout.iconMd; // 24
      case 'lg':
        return layout.iconLg; // 28
      case 'xl':
        return layout.iconXl; // 32
      default:
        return 24;
    }
  }, [size, layout]);

  const resolvedColor = React.useMemo(() => {
    if (!color) return colors.textPrimary;
    // Check if color matches a theme token key
    if (color in colors) {
      return (colors as Record<string, string>)[color];
    }
    return color;
  }, [color, colors]);

  const IconComponent: LucideIcon = typeof name === 'string' ? ICON_MAP[name] || Heart : name;

  return (
    <IconComponent
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      accessibilityLabel={accessibilityLabel}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={style as any}
    />
  );
};

