import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import i18n from 'i18next';
import { slugify } from 'modern-diacritics';



export const useLanguageChangeHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const oldSections = window.sections;
    
    const handleLanguageChange = (lng: string) => {
        console.log('Language changed to: ' + lng)

        const path = location.pathname.replace('/', '')
        const currentSection = oldSections.find((s) => { return s['slug'] === path })
        // we need to reload if we are on the impressum page
        if (path === 'impressum') {
            navigate('/impressum')
            return
        }
        // else we need to get the new sections and check if the current section has a translation
        let sectionsLocal = window.localStorage.getItem(`sections_${lng}`);
        // @ts-ignore
        let newSections: SectionT[] = [];
        // TODO: Explore method using localizations by i18n instead of new requests
        if (sectionsLocal !== null) {
            newSections = JSON.parse(sectionsLocal)
        } else {
            console.error('No sections found in local storage')
            return
        }
        if (currentSection) {
            const localizedSection = newSections.find((s: any) => { return s['sorting'] === currentSection['sorting'] })
            // if the current section has the requested localization, we need to redirect to the new section
            if (newSections && localizedSection) {
                const newCurrentSection = newSections.find((s: any) => { return s['sorting'] === localizedSection['sorting'] })
                if (newCurrentSection) {
                    navigate('/' + slugify(newCurrentSection.title))
                    return;
                }
            }
        }
        // if no localized section is found, we need to redirect to the start page
        navigate('/')
    }

    useEffect(() => {
        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };

    }, [navigate, location]);
};
