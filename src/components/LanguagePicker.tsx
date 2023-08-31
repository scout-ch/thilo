import { useLocation, useNavigate } from 'react-router-dom'
import { GlobeIcon } from '@primer/octicons-react'

import { ActionList, ActionMenu, IconButton, Link, Tooltip } from '@primer/react'

import i18n from '../i18n'
import { SectionT } from './Section'
import { withTranslation } from 'react-i18next'

type Props = {
  t?: any
  xs?: boolean
  mediumOrLower?: boolean
}

const LanguagePicker = ({ t, xs, mediumOrLower }: Props) => {
  const navigate = useNavigate()
  const location = useLocation();
  const languages = {
    "de": {name:"Deutsch"},
    "fr": {name:"Français"},
    "it": {name:"Italiano"},
    // "en": {name:"English (not implemented)"},
  };
  
  const langs = Object.keys(languages)
  
  const locale = i18n.language;
  const selectedLang = languages[locale as keyof typeof languages];

  if (langs.length < 2) {
    return null
  }

  const changeLanguage = (lang: string, location: any, oldSections: SectionT[]) => {
    let redirect = false
    const path = location.pathname.replace('/', '')
    const currentSection = oldSections.find((s) => { return s['slug'] === path })
    i18n.changeLanguage(lang).then((_t) => {
      // we need to reload if we are on the impressum page
      if (path === 'impressum') {
        redirect = true
        return
      }
      // else we need to get the new sections and check if the current section has a translation
      let sectionsLocal = window.localStorage.getItem(`sections_${lang}`);
      let newSections: SectionT[] = [];
      if(sectionsLocal !== null) {
        newSections = JSON.parse(sectionsLocal)
      } else {
        console.error('No sections found in local storage')
        return
      }
      if (currentSection) {
        // TODO: Explore method using localizations by i18n instead of new requests
        // const localizedSection = currentSection['localizations'].find((l: any) => { return l.locale === lang })
        const localizedSection = newSections.find((s: any) => { return s['sorting'] === currentSection['sorting'] })

        // if the current section has the requested localization, we need to redirect to the new section
        if(newSections && localizedSection) {
          const newCurrentSection = newSections.find((s: any) => { return s['sorting'] === localizedSection['sorting'] })
          if (newCurrentSection) {
            redirect = true
            navigate('/' + newCurrentSection.slug)
          }
        }
      }
      // if no localized section is found, we need to redirect to the start page
      if (!redirect) {
        navigate('/')
      }
    });
  }


  // languageList is specifically <ActionList.Item>'s which are reused
  // for menus that behave differently at the breakpoints.
  const languageList = langs.map((lang) => (
    <ActionList.Item
      key={`/${lang}`}
      selected={lang === locale}
      as={Link}
      href={`/${lang}`}
      onSelect={() => {
        if (lang) {
          try {
            changeLanguage(lang, location, window.sections)
          } catch (err) {
            console.warn('Unable to set preferred language', err)
          }
        }
      }}
    >
      <span data-testid="default-language">{languages[lang as keyof typeof languages].name}</span>
    </ActionList.Item>
  ))

  // At large breakpoints, we return the full <ActionMenu> with just the languages,
  // at smaller breakpoints, we return just the <ActionList> with its items so that
  // the <Header> component can place it inside its own <ActionMenu> with multiple
  // groups, language being just one of those groups.
  return (
    <div data-testid="language-picker" className="d-flex">
      {xs ? (
        <>
          {/* XS Mobile Menu */}
          <ActionMenu>
            <ActionMenu.Anchor>
              <ActionMenu.Button
                variant="invisible"
                className="color-fg-default width-full"
                aria-label={`Select language: current language is ${selectedLang.name}`}
                sx={{
                  height: 'auto',
                  textAlign: 'left',
                  'span:first-child': { display: 'inline' },
                }}
              >
                <span style={{ whiteSpace: 'pre-wrap' }}>{"t('language_picker_label')\n"}</span>
                <span className="color-fg-muted text-normal f6">{selectedLang.name}</span>
              </ActionMenu.Button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay align="start">
              <ActionList selectionVariant="single">{languageList}</ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </>
      ) : mediumOrLower ? (
        <ActionList className="hide-sm" selectionVariant="single">
          <ActionList.Group title={"t('language_picker_label')"}>{languageList}</ActionList.Group>
        </ActionList>
      ) : (
        <ActionMenu>
          <ActionMenu.Anchor>
            <Tooltip aria-label={t("languagePicker.tooltip")}>
              <IconButton
                icon={GlobeIcon}
                aria-label={`Select language: current language is ${selectedLang.name}`}
              />
            </Tooltip>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay align="end">
            <ActionList selectionVariant="single">{languageList}</ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </div>
  )
}

export default withTranslation()(LanguagePicker)