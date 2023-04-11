import React from 'react'
import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LinkComponent } from '../helper/MarkdownComponents'
import Chapter, { ChapterT } from './Chapter'

export type SectionT = {
    chapters: Array<ChapterT>
    sorting: number
    title: string
    content: string | null
    slug: string
    menu_name: string
    localizations: any
    color_primary?: string
    color_primary_light?: string
    icon?: IconT
}

export type IconT = {
    url: string
    mime: string
}

type Props = {
    section: SectionT
}

function Section(props: Props) {
    const chapters = props.section['chapters'].sort(function (a: ChapterT, b: ChapterT) {
        return a.sorting - b.sorting;
    }).map(function (chapter: ChapterT) {
        return <Chapter key={chapter.title} data={chapter}></Chapter>
    })
    let classes=`section-title section-${props.section.sorting}`;
    const root = document.documentElement;
    if(props.section.color_primary)
        root.style.setProperty('--color-primary', props.section.color_primary);
    if(props.section.color_primary_light)
        root.style.setProperty('--color-primary-light', props.section.color_primary_light);


    return <div className='content'>
        <Helmet><title>{props.section['title']}</title></Helmet>
        <div className='content-main'>
            <div id="section-title" className={classes}>
                {props.section.icon && (<img className='icon' src={props.section.icon.url} alt="icon" />)}
                <h1>{props.section['title']}</h1>
            </div>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={LinkComponent}
            >{props.section.content ?? ''}</ReactMarkdown>
            {chapters}
        </div>
    </div>
}

export default withTranslation()(Section)
