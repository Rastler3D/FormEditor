// src/contexts/ThemeContext.tsx
import {createContext, useContext, createSignal, JSX, createEffect} from 'solid-js';

type ThemeContextType = {
    isDark: () => boolean;
    isLight: () => boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>();

export function ThemeProvider(props: { children: JSX.Element }) {
    const [isDark, setIsDark] = createSignal(false);
    const isLight = () => !isDark();
    const toggleTheme = () => setIsDark(!isDark());
    
    createEffect(() => {
        if (isDark()){
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
    
    return (
        <ThemeContext.Provider value={{ isDark, isLight, toggleTheme }}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext)!;
}