"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type LanguageContextType = {
  language: string
  setLanguage: (language: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Simple translations object - would be expanded with proper i18n system
const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.login": "Log in",
    "nav.signup": "Sign up",
    // Add more translations as needed
  },
  fr: {
    "nav.login": "Se connecter",
    "nav.signup": "S'inscrire",
    // Add more translations as needed
  },
  // Add more languages as needed
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en")

  // Function to get translation
  const t = (key: string) => {
    return translations[language]?.[key] || key
  }

  // Effect to load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Effect to save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
