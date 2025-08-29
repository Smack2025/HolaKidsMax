import nlTranslations from '@/i18n/nl.json';

type TranslationKeys = typeof nlTranslations;

export function useTranslation() {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = nlTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key if translation is not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t };
}

// Helper function for interpolated translations
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}