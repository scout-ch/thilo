import React from 'react'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown';
// FIXME: rehypeRaw, used for parsing HTML, adds ~60kb to the bundle size. 
// consider if really necessary
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm';
import { LinkComponent } from '../utils/MarkdownComponents';
import { withTranslation } from 'react-i18next'
import type { IconT } from '../components/Section';
import SearchForm from '../components/SearchForm';
import type { SectionT } from '../components/Section'

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

    // The basis of the search are the sections, from which the chapter content is read
    return <div className='content'>
        <Helmet>
            <title>{searchPage.title}</title>
        </Helmet>
        <div className='search'>
            <h1>{searchPage.title}</h1>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]} // FIXME: adds 60kb to the bundle, remove?
                components={LinkComponent}
                children={searchPage.content} 
            />
            <SearchForm sections = {props.sections}></SearchForm>
        </div>
    </div>
}
export default withTranslation()(SearchPage)
