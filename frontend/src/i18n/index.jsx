import { createContext, useContext, useState, useEffect } from 'react'
import zhCN from './zh-CN'
import en from './en'

const translations = { 'zh-CN': zhCN, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh-CN')

  useEffect(() => {
    const saved = localStorage.getItem('mteia-lang')
    if (saved && translations[saved]) setLang(saved)
  }, [])

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang)
      localStorage.setItem('mteia-lang', newLang)
    }
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)