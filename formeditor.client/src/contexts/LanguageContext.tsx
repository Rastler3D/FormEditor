import {createContext, createEffect, createSignal, useContext} from "solid-js";

type Language = 'en' | 'es' | 'fr';
type LanguageContextType = {
    language: () => Language;
    setLanguage: (lang: Language) => boolean;
    t: (string: string) => string;
};


const LanguageContext = createContext<LanguageContextType>();

const translations = {
    en: {
        'TemplateManager': 'Template Manager',
        'My Templates': 'My Templates',
        'My Forms': 'My Forms',
        'All Templates': 'All Templates',
        'All Forms': 'All Forms',
        'Search...': 'Search...',
        'Select language': 'Select language',
        'Toggle theme': 'Toggle theme',
        'User menu': 'User menu',
        'Signed in as': 'Signed in as',
        'Sign out': 'Sign out',
        // Add more translations as needed
    },
    es: {
        'TemplateManager': 'Gestor de Plantillas',
        'My Templates': 'Mis Plantillas',
        'My Forms': 'Mis Formularios',
        'All Templates': 'Todas las Plantillas',
        'All Forms': 'Todos los Formularios',
        'Search...': 'Buscar...',
        'Select language': 'Seleccionar idioma',
        'Toggle theme': 'Cambiar tema',
        'User menu': 'Menú de usuario',
        'Signed in as': 'Conectado como',
        'Sign out': 'Cerrar sesión',
        // Add more translations as needed
    },
    fr: {
        'TemplateManager': 'Gestionnaire de Modèles',
        'My Templates': 'Mes Modèles',
        'My Forms': 'Mes Formulaires',
        'All Templates': 'Tous les Modèles',
        'All Forms': 'Tous les Formulaires',
        'Search...': 'Rechercher...',
        'Select language': 'Sélectionner la langue',
        'Toggle theme': 'Changer de thème',
        'User menu': 'Menu utilisateur',
        'Signed in as': 'Connecté en tant que',
        'Sign out': 'Se déconnecter',
        // Add more translations as needed
    },
};

export function LanguageProvider(props) {
    const [language, setLanguage] = createSignal('en');

    createEffect(() => {
        const storedLanguage = localStorage.getItem('language');
        if (storedLanguage) {
            setLanguage(storedLanguage);
        }
    });

    const t = (key) => {
        return translations[language()][key] || key;
    };

    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {props.children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext)!;
}