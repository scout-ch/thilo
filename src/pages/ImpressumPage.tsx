import React from 'react'
import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LinkComponent } from '../components/markdown/MarkdownComponents'
import i18n from '../i18n'
import client from '../client'

export type ImpressumPageT = {
  title: string
  menu_name: string
  content: string
}

function ImpressumPage() {
  const lang = i18n.language

  const [impressumPage, setImpressumPage] = React.useState<ImpressumPageT | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    client.get(`/impressum-page?_locale=${lang}`)
      .then((response: { data: ImpressumPageT }) => {
        setImpressumPage(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching impressum page:', error)
        setLoading(false)
      })
  }, [lang])

  if (loading) {
    return <div className='content'>
      <div className='p-3'>Loading...</div>
    </div>
  }

  if (!impressumPage) {
    return <div className='content'>
      <div className='p-3'>Impressum page not found.</div>
    </div>
  }

  return <div className='content'>
    <Helmet>
      <title>{impressumPage.title}</title>
    </Helmet>
    
    <div id="section-title" className="section-title mb-2">
      <h1 className="bg-primary px-2">{impressumPage.title}</h1>
    </div>

    <div className='section-body rounded p-3 color-bg-default'>
      <div className='section-description'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={LinkComponent}
        >
          {impressumPage.content}
        </ReactMarkdown>
      </div>
    </div>
  </div>
}

export default withTranslation()(ImpressumPage)
