export type AppThemeKey = 'dark-emerald' | 'dark-midnight' | 'light-nordic' | 'light-paper';

export interface ThemeColors {
  bgBase: string;
  bgSurface: string;
  bgCard: string;
  bgCardSecondary: string;
  bgElevated: string;
  bgInner: string;
  bgRim: string;
  bgBackdrop: string;
  primary: string;
  primaryDim: string;
  primaryHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  borderGlass: string;
  borderSubtle: string;
  isDark: boolean;
  navSelectedIcon: string;
  navSelectedLabel: string;
  navUnselectedIcon: string;
  navUnselectedLabel: string;
  navPillBg: string;
  navPillBorder: string;
  glowColor: string;
  statusPresent: string;
  statusPresentBg: string;
}

export const Themes: Record<AppThemeKey, ThemeColors> = {
  'dark-emerald': {
    bgBase: '#050907',
    bgSurface: '#0C0F0D',
    bgCard: '#0F1310',
    bgCardSecondary: '#141A16',
    bgElevated: '#17201A',
    bgInner: '#090D0B',
    bgRim: '#1B271F',
    bgBackdrop: 'rgba(5, 9, 7, 0.85)',
    primary: '#00E676',
    primaryDim: '#00796B',
    primaryHighlight: '#69F0AE',
    textPrimary: '#F0FFF4',
    textSecondary: '#B2DFDB',
    textMuted: '#6B8F7A',
    textDisabled: '#3D5247',
    borderGlass: 'rgba(0, 230, 118, 0.22)',
    borderSubtle: '#1F3028',
    isDark: true,
    navSelectedIcon: '#FFFFFF',
    navSelectedLabel: '#00E676',
    navUnselectedIcon: '#4A6B58',
    navUnselectedLabel: '#6B8F7A',
    navPillBg: 'rgba(0, 230, 118, 0.18)',
    navPillBorder: 'rgba(0, 230, 118, 0.35)',
    glowColor: 'rgba(0, 230, 118, 0.15)',
    statusPresent: '#00E676',
    statusPresentBg: 'rgba(0, 230, 118, 0.14)',
  },
  'dark-midnight': {
    bgBase: '#07070F',
    bgSurface: '#0E0E1C',
    bgCard: '#121224',
    bgCardSecondary: '#181830',
    bgElevated: '#1F1F3D',
    bgInner: '#0A0A17',
    bgRim: '#26264A',
    bgBackdrop: 'rgba(7, 7, 15, 0.85)',
    primary: '#8B5CF6',
    primaryDim: '#6D28D9',
    primaryHighlight: '#A78BFA',
    textPrimary: '#F5F3FF',
    textSecondary: '#DDD6FE',
    textMuted: '#8B8BA7',
    textDisabled: '#4C4C6D',
    borderGlass: 'rgba(139, 92, 246, 0.25)',
    borderSubtle: '#28284C',
    isDark: true,
    navSelectedIcon: '#FFFFFF',
    navSelectedLabel: '#A78BFA',
    navUnselectedIcon: '#63638E',
    navUnselectedLabel: '#8B8BA7',
    navPillBg: 'rgba(139, 92, 246, 0.22)',
    navPillBorder: 'rgba(139, 92, 246, 0.40)',
    glowColor: 'rgba(139, 92, 246, 0.18)',
    statusPresent: '#8B5CF6',
    statusPresentBg: 'rgba(139, 92, 246, 0.18)',
  },
  'light-nordic': {
    bgBase: '#F0F4F8',
    bgSurface: '#FFFFFF',
    bgCard: '#FFFFFF',
    bgCardSecondary: '#F1F5F9',
    bgElevated: '#E2E8F0',
    bgInner: '#F8FAFC',
    bgRim: '#CBD5E1',
    bgBackdrop: 'rgba(240, 244, 248, 0.85)',
    primary: '#0284C7',
    primaryDim: '#0369A1',
    primaryHighlight: '#38BDF8',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textDisabled: '#94A3B8',
    borderGlass: 'rgba(2, 132, 199, 0.18)',
    borderSubtle: '#CBD5E1',
    isDark: false,
    navSelectedIcon: '#0284C7',
    navSelectedLabel: '#0284C7',
    navUnselectedIcon: '#94A3B8',
    navUnselectedLabel: '#64748B',
    navPillBg: 'rgba(2, 132, 199, 0.14)',
    navPillBorder: 'rgba(2, 132, 199, 0.30)',
    glowColor: 'rgba(2, 132, 199, 0.10)',
    statusPresent: '#0284C7',
    statusPresentBg: 'rgba(2, 132, 199, 0.12)',
  },
  'light-paper': {
    bgBase: '#FAF7F2',
    bgSurface: '#FFFFFF',
    bgCard: '#FFFFFF',
    bgCardSecondary: '#F5EDE4',
    bgElevated: '#EFE5D7',
    bgInner: '#FCFAF7',
    bgRim: '#E2D5C3',
    bgBackdrop: 'rgba(250, 247, 242, 0.85)',
    primary: '#D97706',
    primaryDim: '#B45309',
    primaryHighlight: '#F59E0B',
    textPrimary: '#1C1917',
    textSecondary: '#44403C',
    textMuted: '#78716C',
    textDisabled: '#A8A29E',
    borderGlass: 'rgba(217, 119, 6, 0.18)',
    borderSubtle: '#D6C7B2',
    isDark: false,
    navSelectedIcon: '#D97706',
    navSelectedLabel: '#D97706',
    navUnselectedIcon: '#A8A29E',
    navUnselectedLabel: '#78716C',
    navPillBg: 'rgba(217, 119, 6, 0.14)',
    navPillBorder: 'rgba(217, 119, 6, 0.30)',
    glowColor: 'rgba(217, 119, 6, 0.10)',
    statusPresent: '#D97706',
    statusPresentBg: 'rgba(217, 119, 6, 0.12)',
  },
};

export const Colors = {
  // Background Layers
  bgBase: '#050907',
  bgSurface: '#0C0D0C',
  bgCard: '#0F1010',
  bgCardSecondary: '#141414',
  bgElevated: '#141414',
  bgInner: '#0A0B0A',
  bgRim: '#181818',
  bgBackdrop: 'rgba(5, 9, 7, 0.85)',

  // Primary / Accent Tokens
  emeraldPrimary: '#00E676',
  emeraldSecondary: '#00C853',
  emeraldHighlight: '#69F0AE',
  emeraldDim: '#00796B',
  emeraldDeep: '#004D40',

  // Typography
  textPrimary: '#F0FFF4',
  textSecondary: '#B2DFDB',
  textMuted: '#6B8F7A',
  textDisabled: '#3D5247',
  textWhite: '#FFFFFF',

  // Status
  statusPresent: '#00E676',
  statusPresentBg: 'rgba(0, 230, 118, 0.12)',
  statusAbsent: '#FF5252',
  statusAbsentBg: 'rgba(255, 82, 82, 0.14)',
  statusHoliday: '#FFC107',
  statusHolidayBg: 'rgba(255, 193, 7, 0.12)',
  statusPending: '#FFAB40',
  statusPendingBg: 'rgba(255, 171, 64, 0.12)',

  // Borders
  borderSubtle: '#1F3028',
  borderEmerald: '#2D5040',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(0, 230, 118, 0.35)',

  // Nav Bar
  navSelectedIcon: '#FFFFFF',
  navSelectedLabel: '#F0FFF4',
  navUnselectedIcon: '#4A6B58',
  navUnselectedLabel: '#6B8F7A',
  navPillBg: 'rgba(0, 230, 118, 0.18)',
  navPillBorder: 'rgba(0, 230, 118, 0.35)',

  // Glows
  emeraldGlowAlpha: 'rgba(0, 230, 118, 0.12)',
  absentGlowAlpha: 'rgba(255, 82, 82, 0.12)',
};

/**
 * Mutates the shared Colors object to match the active theme.
 * Allows instant color transformation across the application.
 */
export function applyTheme(themeKey: AppThemeKey) {
  const t = Themes[themeKey] || Themes['dark-emerald'];

  Colors.bgBase = t.bgBase;
  Colors.bgSurface = t.bgSurface;
  Colors.bgCard = t.bgCard;
  Colors.bgCardSecondary = t.bgCardSecondary;
  Colors.bgElevated = t.bgElevated;
  Colors.bgInner = t.bgInner;
  Colors.bgRim = t.bgRim;
  Colors.bgBackdrop = t.bgBackdrop;

  Colors.emeraldPrimary = t.primary;
  Colors.emeraldSecondary = t.primaryDim;
  Colors.emeraldHighlight = t.primaryHighlight;
  Colors.emeraldDim = t.primaryDim;

  Colors.textPrimary = t.textPrimary;
  Colors.textSecondary = t.textSecondary;
  Colors.textMuted = t.textMuted;
  Colors.textDisabled = t.textDisabled;

  Colors.statusPresent = t.statusPresent;
  Colors.statusPresentBg = t.statusPresentBg;

  Colors.borderSubtle = t.borderSubtle;
  Colors.borderEmerald = t.borderGlass;
  Colors.borderGlass = t.borderGlass;
  Colors.borderActive = t.primary;

  Colors.navSelectedIcon = t.navSelectedIcon;
  Colors.navSelectedLabel = t.navSelectedLabel;
  Colors.navUnselectedIcon = t.navUnselectedIcon;
  Colors.navUnselectedLabel = t.navUnselectedLabel;
  Colors.navPillBg = t.navPillBg;
  Colors.navPillBorder = t.navPillBorder;
  Colors.emeraldGlowAlpha = t.glowColor;
}
