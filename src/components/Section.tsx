import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LinkComponent } from '../utils/MarkdownComponents'
import Chapter from './Chapter'
import type { ChapterT } from './Chapter'

export type SectionT = {
    id: number,
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
    const root = document.documentElement;
    if(props.section.color_primary){
        root.style.setProperty('--color-primary', props.section.color_primary);
        root.style.setProperty('--color-accent-emphasis', props.section.color_primary);
    }
    
    if(props.section.color_primary_light) {
        root.style.setProperty('--color-primary-light', props.section.color_primary_light);
    }


    return <section className='content'>
        <Helmet><title>{props.section['title']}</title></Helmet>
        <div id="section-title" className={`section-title section-${props.section.sorting} mb-2`}>
            <h1 className={`bg-primary px-2`}>
                {props.section['title']}
            </h1>
            {props.section.icon && (<img className='icon pl-2' src={props.section.icon.url} alt="icon" />)}
        </div>
        <div className='section-body rounded p-3 color-bg-default'>
            <div className='section-description'>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={LinkComponent}
                >{props.section.content ?? ''}
                </ReactMarkdown>
            </div>
        </div>
        {chapters}
    </section>
}

export default withTranslation()(Section)
