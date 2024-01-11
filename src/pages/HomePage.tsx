import React from 'react'
import { Helmet } from 'react-helmet-async'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LinkComponent } from '../utils/MarkdownComponents';
import { withTranslation } from 'react-i18next';
import type { IconT } from '../components/Section';

export type StartPage = {
  title: string
  menu_name: string
  icon: IconT
  content: string
}
type Props = {
  page: StartPage
}


// all content comes from the backend as json with markdown
function HomePage(props: Props) {
  const startPage = props.page

  return <div className='content'>
    <Helmet>
      <title>{startPage.title}</title>
    </Helmet>
    
    <div id="section-title" className="section-title section-1 mb-2">
      <h1 class="bg-primary px-2">{startPage.title}</h1>
    </div>


    <div className='section-body rounded p-3 border color-bg-default'>
      <div className='section-description'>
        <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={LinkComponent}
            >{startPage.content}</ReactMarkdown>

      </div>

    </div>

  </div>

}
export default withTranslation()(HomePage)