import type { ThemeConfig } from '../types/document';

export const THEMES: Record<string, ThemeConfig> = {
  havells: {
    id: 'havells',
    name: 'Havells Industrial Benchmark',
    primaryColor: '#002060',
    secondaryColor: '#1e293b',
    tableHeaderBg: '#002060',
    tableHeaderColor: '#ffffff',
    borderColor: '#334155',
    fontFamily: "'Inter', sans-serif",
    accentColor: '#059669',
    logoText: 'HAVELLS NABL ACCREDITED TESTING LABORATORY',
    compactPadding: false,
  },
  nabl: {
    id: 'nabl',
    name: 'NABL Official Laboratory Format',
    primaryColor: '#0f172a',
    secondaryColor: '#334155',
    tableHeaderBg: '#1e293b',
    tableHeaderColor: '#ffffff',
    borderColor: '#475569',
    fontFamily: "'Inter', sans-serif",
    accentColor: '#2563eb',
    logoText: 'NATIONAL ACCREDITATION BOARD FOR TESTING LABS',
    compactPadding: true,
  },
  iec: {
    id: 'iec',
    name: 'IEC CB Scheme Official Standard',
    primaryColor: '#1e3a8a',
    secondaryColor: '#475569',
    tableHeaderBg: '#1e3a8a',
    tableHeaderColor: '#ffffff',
    borderColor: '#64748b',
    fontFamily: "'Inter', sans-serif",
    accentColor: '#0284c7',
    logoText: 'IEC SYSTEM FOR MUTUAL RECOGNITION OF TEST CERTIFICATES',
    compactPadding: true,
  },
  minimal: {
    id: 'minimal',
    name: 'Industrial Minimal',
    primaryColor: '#0f172a',
    secondaryColor: '#64748b',
    tableHeaderBg: '#0f172a',
    tableHeaderColor: '#ffffff',
    borderColor: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    accentColor: '#0d9488',
    logoText: 'TESTING LABORATORY CERTIFICATE',
    compactPadding: false,
  },
};

export function getTheme(themeId: string): ThemeConfig {
  return THEMES[themeId] || THEMES.havells;
}
