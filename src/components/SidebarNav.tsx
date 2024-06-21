import { Link as ReactRouterLink, useLocation } from 'react-router-dom'
import type { ChapterT } from './Chapter'
import type { SectionT } from './Section'

import { NavList, Truncate, Link} from '@primer/react'
import cx from 'classnames'

import { HomeIcon, BookmarkIcon, BookmarkFillIcon, RepoIcon } from '@primer/octicons-react'
import { withTranslation } from 'react-i18next'
// icons related to books:
// RepoIcon, RepoCloneIcon, RepoPullIcon, RepoPushIcon, RepoLockedIcon, RepoForkedIcon, RepoDeletedIcon, RepoTemplateIcon 

type Props = {
    t?: any
    startPageMenuName?: String
    variant?: 'full' | 'overlay'
}

function SidebarNav(props: Props) {
    const { t } = props

    // location and navigate for browsing sections and chapters via hash links
    const location = useLocation()
    const sections = window.sections;

    const sectionListNavItems = sections.map(function (section: SectionT, index: number) {
        const sectionActive = location.pathname.replace('/', '') === section.slug;
        const id = `nav_item_${section.sorting}_${section.slug}`;
        
        // const sectionIndex = sections.findIndex((s: SectionT) => s.sorting === section.sorting)

        // const icons = [RepoIcon, RepoCloneIcon, RepoPullIcon, RepoPushIcon, RepoLockedIcon, RepoForkedIcon, RepoDeletedIcon, RepoTemplateIcon];
        // const DynamicIcon = icons[section.sorting % icons.length]
        // console.log(DynamicIcon)

        const chapters = section.chapters
        const chapterNavItems = chapters.sort(function (a: ChapterT, b: ChapterT) {
            return a.sorting - b.sorting;
        }).map(function (chapter: ChapterT) {
            const isActive = location.hash.replace('#', '') === chapter.slug
            const id = `subnav_item_${chapter.sorting}_${chapter.slug_with_section}`;
            return (
                <NavList.Item 
                    className={cx('ml-4', `${chapter.slug_with_section}`)} 
                    style={{color: section.color_primary}}
                    aria-current={isActive && "location"} // for primer color highlight
                    key={id} id={id}
                    as={ReactRouterLink} to={(`${chapter.slug_with_section}`)}
                >
                    <NavList.LeadingVisual style={{color: section.color_primary}}>
                        {/* fill has to be added to the parent, as the prop isn't
                        working on the Icon objects */}
                        {isActive ? <BookmarkFillIcon/> : <BookmarkIcon/>}
                    </NavList.LeadingVisual>
                    <span className={cx(isActive && 'text-bold')}
                    style={{color: section.color_primary}}
                    >
                      {chapter.menu_name}

                    </span>
                </NavList.Item>
            )
        })

        return (
            <NavList.Item 
            id={id} key={id}
            className={cx(section.slug, sectionActive && 'active')}
            aria-current={sectionActive && "page"}
            // hack to open active section on page load, null if false to avoid console error
            defaultOpen={sectionActive ? true: null}
            as={ReactRouterLink} to={section.slug}
            >
                <NavList.LeadingVisual style={{color: section.color_primary}}>
                    {/* <DynamicIcon/> */}
                    {section.icon && 
                        (<img className='icon' src={section.icon.url} alt="icon" width='16px' height='16px' />)
                    }
                    {!section.icon && 
                        <RepoIcon />
                    }
                </NavList.LeadingVisual>
                { chapterNavItems.length > 0
                    ? 
                    <Link as={ReactRouterLink} to={section.slug}>
                        <Truncate title={section.menu_name} as='span' 
                        className={cx('d-inline-block', sectionActive && 'text-bold')} maxWidth={200}
                        style={{color: section.color_primary}}
                        >
                            {section.menu_name}
                        </Truncate>
                    </Link>
                    : <Truncate title={section.menu_name} as='span' 
                    className={cx('d-inline-block', sectionActive && 'text-bold')} maxWidth={200}
                    style={{color: section.color_primary}}
                    >
                        {section.menu_name}
                    </Truncate>
                }
                { chapterNavItems.length > 0 && <NavList.SubNav>
                    {chapterNavItems}
                </NavList.SubNav> }

            </NavList.Item>
            
        )
    });

 
    const variant = props.variant;


    return (
        <div data-container="nav"
            style={{minWidth: '261px', minHeight: 'var(--sticky-pane-height)'}}
            className={cx(variant === 'full' ? 'position-sticky d-xxl-block d-lg-block d-none border-right height-full color-border-subtle' : '')}
        >
            <NavList className={cx("primary-nav")}>
                <NavList.Item as={ReactRouterLink} to='/'
                    aria-current={location.pathname === '/' && "page"}
                    className={cx(
                    location.pathname === '/' && 'text-bold'
                    )}
                >
                    <NavList.LeadingVisual><HomeIcon/></NavList.LeadingVisual> 
                    {t('sidebar.home')}
                </NavList.Item>
                {sectionListNavItems}
            </NavList>
            <div
            className={cx(
            variant === 'overlay' ? 'd-xxl-none' : 'd-none d-lg-block d-xxl-block',
            
            )}
            >
            </div>
        </div>
    )
}

export default withTranslation()(SidebarNav)
