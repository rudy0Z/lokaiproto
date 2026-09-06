/**
 * The app's icon set — LAYER 2.5 of the design system.
 *
 * One animated library, aliased to app-semantic names so a screen asks for
 * `IconMenu`, not a vendor glyph name. Source: `@animateicons/react` (MIT,
 * built on motion/react — already this app's animation engine). Every icon is a
 * `forwardRef` that animates on hover/focus and exposes `{startAnimation,
 * stopAnimation}` for imperative triggers; props are `size`, `color`,
 * `isAnimated`, `duration`.
 *
 * Why a library over the previous static Phosphor set: the walkthrough asked for
 * motion the flat icons didn't have. Aliasing here means the whole app moves in
 * one edit if the set ever changes again, and no screen hard-codes a vendor name.
 * The composer's send/attach/mic stay bespoke (Turn.tsx) — the highest-touch
 * controls earn hand-drawn motion rather than a stock glyph.
 */

export {
  MenuIcon as IconMenu,
  MessageSquarePlusIcon as IconNewChat,
  ArrowLeftIcon as IconBack,
  ArrowRightIcon as IconArrowRight,
  ArrowUpRightIcon as IconArrowUpRight,
  ChevronRightIcon as IconChevronRight,
  ChevronDownIcon as IconChevronDown,
  SearchIcon as IconSearch,
  PlusIcon as IconPlus,
  SettingsIcon as IconSettings,
  XIcon as IconClose,
  FileTextIcon as IconFile,
  FolderIcon as IconFolder,
  PaperclipIcon as IconAttach,
  CheckIcon as IconCheck,
  ImageIcon as IconImage,
  ShieldCheckIcon as IconShield,
  GlobeIcon as IconGlobe,
  MoonIcon as IconMoon,
  BellIcon as IconBell,
  CompassIcon as IconCompass,
  CameraIcon as IconCamera,
  MicIcon as IconMic,
  InfoIcon as IconInfo,
  CopyIcon as IconCopy,
  PrinterIcon as IconPrint,
  PencilIcon as IconPencil,
  TriangleAlertIcon as IconWarning,
  CircleCheckIcon as IconCircleCheck,
} from '@animateicons/react/lucide';
