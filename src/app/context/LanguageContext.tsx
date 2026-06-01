import React, { createContext, useContext, useState } from 'react';

type LanguageType = 'en' | 'hi' | 'ta' | 'mr';

interface LanguageContextType {
  uiLang: LanguageType;
  setUiLang: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  uiLang: 'en',
  setUiLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [uiLang, setUiLang] = useState<LanguageType>('en');

  return (
    <LanguageContext.Provider value={{ uiLang, setUiLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
