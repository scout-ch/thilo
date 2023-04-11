// import styled from '@emotion/styled'
import React from 'react'
//import { HelmetProvider } from 'react-helmet-async'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LinkComponent } from '../helper/MarkdownComponents';
import { withTranslation } from 'react-i18next';
import { IconT } from '../components/Section';

export type StartPage = {
  title: string
  menu_name: string
  icon: IconT
  content: string
}
type Props = {
  page: StartPage
}

function HomePage(props: Props) {
  const startPage = props.page

  return <div className='content-main'>
    <title>{startPage.title}</title>
    
    <h1>{startPage.title}</h1>

    <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={LinkComponent}
        >{startPage.content}</ReactMarkdown>

  </div>
}
export default withTranslation()(HomePage)