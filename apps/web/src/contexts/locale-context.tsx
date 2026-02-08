"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Locale, defaultLocale, isValidLocale, getTranslations } from "@/lib/i18n";

/**
 * 检测浏览器首选语言并匹配支持的语言
 * 优先级：localStorage > 浏览器语言 > 默认语言
 */
function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return defaultLocale;
  }

  // 获取浏览器语言列表
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    // 提取语言代码（例如 "zh-CN" -> "zh"）
    const langCode = lang.split("-")[0].toLowerCase();

    // 检查是否匹配支持的语言
    if (isValidLocale(langCode)) {
      return langCode;
    }
  }

  return defaultLocale;
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getTranslations>;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

type LocaleProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "ucp-locale";

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 优先使用 localStorage 中的设置
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      setLocaleState(stored);
    } else {
      // 否则使用浏览器语言检测
      const detectedLocale = detectBrowserLocale();
      setLocaleState(detectedLocale);
      // 保存检测到的语言，避免下次重复检测
      localStorage.setItem(STORAGE_KEY, detectedLocale);
    }
    setIsInitialized(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  const t = getTranslations(locale);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
