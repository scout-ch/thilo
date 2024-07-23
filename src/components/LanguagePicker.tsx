import { GlobeIcon } from '@primer/octicons-react'

import { ActionList, ActionMenu, IconButton, Tooltip } from '@primer/react'

import i18n from '../i18n'
import { withTranslation } from 'react-i18next'

type Props = {
  t?: any
  xs?: boolean
  mediumOrLower?: boolean
}

const LanguagePicker = ({ t, xs, mediumOrLower }: Props) => {
  const languages = {
    "de": {name: "Deutsch"},
    "fr": {name: "Français"},
    "it": {name: "Italiano"},
    // "en": {name:"English (not implemented)"},
  };
  
  const lngs = Object.keys(languages)
  
  const locale = i18n.language;
  const selectedLang = languages[locale as keyof typeof languages];

  if (lngs.length < 2) {
    return null
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
}


  // languageList is specifically <ActionList.Item>'s which are reused
  // for menus that behave differently at the breakpoints.
  const languageList = lngs.map((lng) => (
    <ActionList.Item
      key={`/${lng}`}
      selected={lng === locale}
      onSelect={() => {
        if (lng) {
          try {
            // console.log('LanguagePicker change to: ' + lng)
            changeLanguage(lng)
          } catch (err) {
            console.warn('Unable to set preferred language', err)
          }
        }
      }}
    >
      <span>{languages[lng as keyof typeof languages].name}</span>
    </ActionList.Item>
  ))

  // At large breakpoints, we return the full <ActionMenu> with just the languages,
  // at smaller breakpoints, we return just the <ActionList> with its items so that
  // the <Header> component can place it inside its own <ActionMenu> with multiple
  // groups, language being just one of those groups.
  return (
    <div className="d-flex">
      {xs ? (
        <>
          {/* XS Mobile Menu */}
          <ActionMenu>
            <ActionMenu.Anchor>
              <ActionMenu.Button
                className="width-full mb-3"
                aria-label={`Select language: current language is ${selectedLang.name}`}
                sx={{
                  height: 'auto',
                  textAlign: 'left',
                  'span:first-child': { display: 'inline' },
                }}

              >
                <span style={{ whiteSpace: 'pre-wrap' }}>{t('languagePicker.tooltip')+'\n'}</span>
                <span className="color-fg-muted text-normal f6">{selectedLang.name}</span>
              </ActionMenu.Button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay align="end">
              <ActionList selectionVariant="single">{languageList}</ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </>
      ) : mediumOrLower ? (
        <ActionList className="hide-sm width-full" selectionVariant="single">
          <ActionList.Group title={t('languagePicker.tooltip')}>{languageList}</ActionList.Group>
        </ActionList>
      ) : (
        <ActionMenu>
          <ActionMenu.Anchor>
            <Tooltip aria-label={t("languagePicker.tooltip")} direction='s'>
              <IconButton
                icon={GlobeIcon}
                aria-label={`${t('languagePicker.tooltip')}: ${selectedLang.name}`}
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