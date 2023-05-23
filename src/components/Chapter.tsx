import React from 'react'
import { withTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LinkComponent } from '../helper/MarkdownComponents'
import { IconT } from './Section'
import Target from './Target'

export type Role = {
    rolle: string
}

export type ChapterT = {
    id: number
    sorting: number
    title: string
    menu_name: string
    content: string
    slug: string
    slug_with_section: string
    icon?: IconT
    section: number
    responsible: Array<Role>
    line_height?: number
}

type ChapterProps = {
    t: any
    data: ChapterT;
};

function Chapter(props: ChapterProps) {
    const data = props.data
    if (!data) {
        return null
    }

    // get line height from chapter or use default
    let style;
    if(data.line_height) {
        style = {lineHeight: data.line_height}
    } else {
        style = {lineHeight: 'var(--line-height)'}
    }

    // render chapter
    // slug is used for anchor links
    return <div className='chapter' style={style}>
        <div id={data.slug}>

            <div className="chapter-title">
                <h2 id={data.slug}>
                    {data.icon && (<img className='icon' src={data.icon.url} alt="icon" />)}
                    {data.title}
                </h2>
            </div>
            <div className='chapter-main'>
                <Target targets={data.responsible} />
                <ReactMarkdown remarkPlugins={[remarkGfm]}
                    components={LinkComponent}>{data.content}</ReactMarkdown>
                
            </div>
        </div>
    </div>
}

export default withTranslation()(Chapter)
