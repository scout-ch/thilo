import React from 'react'
// import { HelmetProvider } from 'react-helmet-async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LinkComponent } from '../helper/MarkdownComponents';
import { withTranslation } from 'react-i18next'
import { IconT } from '../components/Section';
import SearchForm from '../components/SearchForm';
import { SectionT } from '../components/Section'

export type SearchPageT = {
    title: string
    menu_name: string
    icon: IconT
    content: string
}

type Props = {
    page: SearchPageT
    sections: Array<SectionT>
}

function SearchPage(props: Props) {
    const searchPage = props.page

    return <div className='content-main'>
        <title>{searchPage.title}</title>

        <div className='search'>
            <h1><FontAwesomeIcon icon="search" /> {searchPage.title}</h1>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={LinkComponent}
            >{searchPage.content}</ReactMarkdown>

            <SearchForm sections = {props.sections}></SearchForm>
        </div>
    </div>
}
export default withTranslation()(SearchPage)
