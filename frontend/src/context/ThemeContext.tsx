import { createContext, useContext, useState, ReactNode } from 'react';
import { getTheme, Theme } from '../utils/themes';

interface ThemeContextType {
    activeCategory: string;
    activeTheme: string;
    setActiveCategory: (category: string, theme?: string) => void;
    currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeTheme, setActiveTheme] = useState('all');

    const handleSetActiveCategory = (category: string, theme?: string) => {
        setActiveCategory(category);
        if (theme) {
            setActiveTheme(theme);
        } else {
            // Fallback to category as theme if no theme provided
            setActiveTheme(category);
        }
    };

    const currentTheme = getTheme(activeTheme);

    return (
        <ThemeContext.Provider value={{ 
            activeCategory, 
            activeTheme,
            setActiveCategory: handleSetActiveCategory, 
            currentTheme 
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}
