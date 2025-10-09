// Centralized icon imports to optimize bundle size
// Import only the icons we actually use

// Heroicons Outline
export {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  XMarkIcon,
  DocumentTextIcon,
  PrinterIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

// Heroicons Solid
export {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid'

// Lucide React
export {
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Code,
  Loader2,
  Mail,
  AlertCircle,
  Quote,
  X,
  Send,
  Circle,
  Calculator,
  Save,
  FileText,
  RotateCcw,
  Trash2,
  Plus,
  Printer,
  Filter,
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Icon component factory for consistent styling
export const createIcon = (
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>
) => {
  return function Icon({
    className = 'h-5 w-5',
    ...props
  }: React.SVGProps<SVGSVGElement>) {
    return <IconComponent className={className} {...props} />
  }
}

// Common icon sizes
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
}

// Icon with consistent styling hook
export function useIcon(
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  size: keyof typeof iconSizes = 'md'
) {
  return function StyledIcon({
    className,
    ...props
  }: React.SVGProps<SVGSVGElement>) {
    return (
      <IconComponent
        className={`${iconSizes[size]} ${className || ''}`}
        {...props}
      />
    )
  }
}
