import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
// FIXME: rehypeRaw, used for parsing HTML, adds ~60kb to the bundle size. 
// consider if really necessary
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { LinkComponent } from '../utils/MarkdownComponents'
import Chapter from './Chapter'
import type { ChapterT } from './Chapter'

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
    if(props.section.color_primary){
        root.style.setProperty('--color-primary', props.section.color_primary);
        root.style.setProperty('--color-accent-emphasis', props.section.color_primary);
    }
    
    if(props.section.color_primary_light) {
        root.style.setProperty('--color-primary-light', props.section.color_primary_light);
    }


    return <div className='content'>
    <Helmet><title>{props.section['title']}</title></Helmet>
        <div id="section-title" className={classes}>
            <h1>
                {props.section.icon && (<img className='icon' src={props.section.icon.url} alt="icon" />)}
                {props.section['title']}
            </h1>
        </div>
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]} // FIXME: adds 60kb to the bundle, remove?
            components={LinkComponent}
            children={props.section.content ?? ''}   
        />
        {chapters}
    </div>

}

export default withTranslation()(Section)
