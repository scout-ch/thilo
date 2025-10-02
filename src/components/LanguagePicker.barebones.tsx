import { GlobeIcon } from './icons.barebones'
import { Dropdown, DropdownItem, DropdownGroup } from './Dropdown.barebones'
import IconButton from './IconButton.barebones'
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
  }
  
  const lngs = Object.keys(languages)
  const locale = i18n.language
  const selectedLang = languages[locale as keyof typeof languages]

  if (lngs.length < 2) {
    return null
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const languageList = lngs.map((lng) => (
    <DropdownItem
      key={lng}
      selected={lng === locale}
      onClick={() => changeLanguage(lng)}
    >
      <span>{languages[lng as keyof typeof languages].name}</span>
    </DropdownItem>
  ))

  // XS Mobile Menu variant
  if (xs) {
    return (
      <div className="language-picker language-picker-xs">
        <Dropdown
          trigger={
            <button className="language-picker-button language-picker-button-full">
              <span className="language-picker-label">{t('languagePicker.tooltip')}</span>
              <span className="language-picker-selected">{selectedLang.name}</span>
            </button>
          }
          align="end"
        >
          {languageList}
        </Dropdown>
      </div>
    )
  }

  // Medium or lower variant (in menu)
  if (mediumOrLower) {
    return (
      <div className="language-picker language-picker-medium">
        <DropdownGroup title={t('languagePicker.tooltip')}>
          {languageList}
        </DropdownGroup>
      </div>
    )
  }

  // Default variant (desktop header)
  return (
    <div className="language-picker language-picker-desktop">
      <Dropdown
        trigger={
          <IconButton
            icon={GlobeIcon}
            aria-label={`${t('languagePicker.tooltip')}: ${selectedLang.name}`}
          />
        }
        align="end"
      >
        {languageList}
      </Dropdown>
    </div>
  )
}

export default withTranslation()(LanguagePicker)
