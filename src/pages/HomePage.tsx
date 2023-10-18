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
    
    <h1>{startPage.title}</h1>

    <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={LinkComponent}
        >{startPage.content}</ReactMarkdown>

  </div>
}
export default withTranslation()(HomePage)