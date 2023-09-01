import React from 'react'
import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'
import i18n from '../i18n';
import client from '../client';

export type ImpressumPageT = {
  title: string
  menu_name: string
  content: string
}

function ImpressumPage() {
  const lang = i18n.language

  const [impressumPage, setImpressumPage] = React.useState<ImpressumPageT>();

  // TODO: create the impressum page, and cache it perhaps
  React.useEffect(() => {
    client.get('/impressum-page?_locale=' + lang).then((response: { data: any }) => {
      setImpressumPage(response.data)
    })
  }, [lang])

  if (!impressumPage) return null

  return <div className='content'>
    <Helmet>
      <title>{impressumPage.title}</title>
    </Helmet>
  </div>
}
export default withTranslation()(ImpressumPage)
