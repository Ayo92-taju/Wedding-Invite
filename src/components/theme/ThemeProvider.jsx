'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)

  // Sync initial state from whatever the pre-hydration script set on <html>.
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      const root = document.documentElement
      root.classList.toggle('dark', next)
      try {
        localStorage.setItem('nv-theme', next ? 'dark' : 'light')
      } catch {
        /* ignore storage errors */
      }
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

/*
 * Inline script (run before hydration) that applies the saved theme — or the
 * system preference — so there's no flash of the wrong theme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('nv-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`
