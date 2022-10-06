import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import impressumPageFR from './../data/impressum-page/fr.json'
import impressumPageDE from './../data/impressum-page/de.json'
import impressumPageIT from './../data/impressum-page/it.json'
import i18n from '../i18n';

export type ImpressumPageT = {
  title: string
  menu_name: string
  content: string
}

function ImpressumPage() {
  const lang = i18n.language

  const [impressumPage, setImpressumPage] = React.useState<ImpressumPageT>();

  React.useEffect(() => {
    switch (i18n.language) {
      case 'fr':
        // @ts-ignore
        return setImpressumPage(impressumPageFR)
      case 'de':
        // @ts-ignore
        return setImpressumPage(impressumPageDE)
      case 'it':
        // @ts-ignore
        return setImpressumPage(impressumPageIT)
      default:
        // @ts-ignore
        setImpressumPage(impressumPageDE)
    }
  }, [lang])

  if (!impressumPage) return null

  return <div className='content-main'>
    <Helmet>
      <title>{impressumPage.title}</title>
    </Helmet>
  </div>
}
export default withTranslation()(ImpressumPage)
