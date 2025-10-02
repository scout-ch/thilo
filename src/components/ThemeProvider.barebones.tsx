import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ColorMode = 'light' | 'dark' | 'auto'

type ThemeContextType = {
    colorMode: ColorMode
    setColorMode: (mode: ColorMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

type ThemeProviderProps = {
    children: ReactNode
    colorMode?: ColorMode
}

export function ThemeProvider({ children, colorMode: initialColorMode = 'light' }: ThemeProviderProps) {
    const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode)

    useEffect(() => {
        // Apply the color mode to the document
        const effectiveMode = colorMode === 'auto' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : colorMode
        
        document.body.setAttribute('data-color-mode', effectiveMode)
    }, [colorMode])

    return (
        <ThemeContext.Provider value={{ colorMode, setColorMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
