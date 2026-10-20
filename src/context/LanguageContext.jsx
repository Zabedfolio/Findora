"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";

const translations = { en, bn };

export const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("findora_lang");
      if (saved && (saved === "en" || saved === "bn")) {
        setLangState(saved);
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  const setLang = useCallback((newLang) => {
    if (newLang !== "en" && newLang !== "bn") return;
    setLangState(newLang);
    try {
      localStorage.setItem("findora_lang", newLang);
      document.cookie = `findora_lang=${newLang}; path=/; max-age=31536000`;
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key) => {
      const dict = translations[lang] || translations.en;
      const parts = key.split(".");
      let current = dict;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          return key;
        }
      }
      return typeof current === "string" ? current : key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
