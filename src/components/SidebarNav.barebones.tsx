import { Link as ReactRouterLink, useLocation } from 'react-router-dom'
import type { ChapterT } from './Chapter'
import type { SectionT } from './Section'
import { useState } from 'react'
import { withTranslation } from 'react-i18next'

type Props = {
    t?: any
    startPageMenuName?: String
    variant?: 'full' | 'overlay'
}

// Simple SVG icons to replace Primer octicons
const HomeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.438 1.157a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"></path>
    </svg>
)

const HomeFillIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Z"></path>
    </svg>
)

const BookmarkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.227.579L8 11.722l-3.773 3.107A.751.751 0 0 1 3 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.91l3.023-2.489a.75.75 0 0 1 .954 0l3.023 2.49V2.75a.25.25 0 0 0-.25-.25Z"></path>
    </svg>
)

const BookmarkFillIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.227.579L8 11.722l-3.773 3.107A.751.751 0 0 1 3 14.25Z"></path>
    </svg>
)

const RepoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
    </svg>
)

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg 
        width="12" 
        height="12" 
        viewBox="0 0 16 16" 
        fill="currentColor"
        style={{ 
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
        }}
    >
        <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
)

function SidebarNav(props: Props) {
    const { t } = props
    const location = useLocation()
    const sections = window.sections
    const variant = props.variant
    
    // Track which sections are expanded
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
        // Auto-expand the current section on mount
        const currentSlug = location.pathname.replace('/', '').split('/')[0]
        return new Set([currentSlug])
    })

    const toggleSection = (slug: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev)
            if (next.has(slug)) {
                next.delete(slug)
            } else {
                next.add(slug)
            }
            return next
        })
    }

    const handleNavItemClick = (e: React.MouseEvent<HTMLElement>) => {
        // Close other sections when clicking on a different section
        const target = e.currentTarget
        const sectionSlug = target.getAttribute('data-section')
        if (sectionSlug) {
            setExpandedSections(new Set([sectionSlug]))
        }
    }

    const truncateText = (text: string, maxLength: number = 25) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const sectionListNavItems = sections.map((section: SectionT) => {
        const sectionActive = location.pathname.replace('/', '') === section.slug
        const sectionSlug = section.slug || ''
        const isExpanded = expandedSections.has(sectionSlug) || sectionActive
        const hasChapters = section.chapters && section.chapters.length > 0

        const chapters = section.chapters || []
        const chapterNavItems = chapters
            .sort((a: ChapterT, b: ChapterT) => a.sorting - b.sorting)
            .map((chapter: ChapterT) => {
                const isActive = location.hash.replace('#', '') === chapter.slug
                return (
                    <li 
                        key={chapter.slug_with_section}
                        className={`nav-subitem ${isActive ? 'active' : ''}`}
                    >
                        <ReactRouterLink 
                            to={`/${chapter.slug_with_section}`}
                            className="nav-sublink"
                            style={{ color: section.color_primary }}
                            onClick={handleNavItemClick}
                        >
                            <span className="nav-icon" style={{ color: section.color_primary }}>
                                {isActive ? <BookmarkFillIcon /> : <BookmarkIcon />}
                            </span>
                            <span 
                                className={`nav-text ${isActive ? 'nav-text-bold' : ''}`}
                                style={{ color: section.color_primary }}
                                title={chapter.menu_name}
                            >
                                {truncateText(chapter.menu_name, 30)}
                            </span>
                        </ReactRouterLink>
                    </li>
                )
            })

        return (
            <li 
                key={section.slug}
                className={`nav-item ${sectionActive ? 'active' : ''}`}
                data-section={section.slug}
            >
                {hasChapters ? (
                    <>
                        <div className="nav-item-header">
                            <button
                                className="nav-toggle"
                                onClick={() => toggleSection(sectionSlug)}
                                aria-expanded={isExpanded}
                                style={{ color: section.color_primary }}
                            >
                                <span className="nav-chevron">
                                    <ChevronIcon isOpen={isExpanded} />
                                </span>
                            </button>
                            <ReactRouterLink
                                to={`/${sectionSlug}`}
                                className="nav-link"
                                data-link={sectionSlug}
                                onClick={handleNavItemClick}
                            >
                                <span className="nav-icon" style={{ color: section.color_primary }}>
                                    {section.icon ? (
                                        <img 
                                            src={section.icon.url} 
                                            alt="icon" 
                                            width="16" 
                                            height="16"
                                        />
                                    ) : (
                                        <RepoIcon />
                                    )}
                                </span>
                                <span 
                                    className={`nav-text ${sectionActive ? 'nav-text-bold' : ''}`}
                                    style={{ color: section.color_primary }}
                                    title={section.menu_name}
                                >
                                    {truncateText(section.menu_name, 25)}
                                </span>
                            </ReactRouterLink>
                        </div>
                        {isExpanded && (
                            <ul className="nav-subnav">
                                {chapterNavItems}
                            </ul>
                        )}
                    </>
                ) : (
                    <ReactRouterLink
                        to={`/${sectionSlug}`}
                        className="nav-link"
                        data-link={sectionSlug}
                        onClick={handleNavItemClick}
                    >
                        <span className="nav-icon" style={{ color: section.color_primary }}>
                            {section.icon ? (
                                <img 
                                    src={section.icon.url} 
                                    alt="icon" 
                                    width="16" 
                                    height="16"
                                />
                            ) : (
                                <RepoIcon />
                            )}
                        </span>
                        <span 
                            className={`nav-text ${sectionActive ? 'nav-text-bold' : ''}`}
                            style={{ color: section.color_primary }}
                            title={section.menu_name}
                        >
                            {truncateText(section.menu_name, 25)}
                        </span>
                    </ReactRouterLink>
                )}
            </li>
        )
    })

    return (
        <div 
            className={`sidebar-nav ${variant === 'full' ? 'sidebar-nav-full' : 'sidebar-nav-overlay'}`}
            data-container="nav"
        >
            <nav className="nav-list-container">
                <ul className="nav-list">
                    <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <ReactRouterLink 
                            to="/" 
                            className="nav-link"
                            data-link=""
                        >
                            <span className="nav-icon">
                                {location.pathname === '/' ? <HomeFillIcon /> : <HomeIcon />}
                            </span>
                            <span className={`nav-text ${location.pathname === '/' ? 'nav-text-bold' : ''}`}>
                                {t('sidebar.home')}
                            </span>
                        </ReactRouterLink>
                    </li>
                    {sectionListNavItems}
                </ul>
            </nav>
        </div>
    )
}

export default withTranslation()(SidebarNav)
