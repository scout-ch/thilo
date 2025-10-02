import { ReactNode } from 'react'

type PageLayoutProps = {
    children: ReactNode
}

type PageLayoutContentProps = {
    children: ReactNode
}

type PageLayoutPaneProps = {
    children: ReactNode
    position?: 'start' | 'end'
    sticky?: boolean
    hidden?: {
        narrow?: boolean
        regular?: boolean
        wide?: boolean
    }
    offsetHeader?: number
}

function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="page-layout">
            {children}
        </div>
    )
}

function PageLayoutContent({ children }: PageLayoutContentProps) {
    return (
        <div className="page-layout-content">
            {children}
        </div>
    )
}

function PageLayoutPane({ children, position = 'start', sticky, hidden, offsetHeader }: PageLayoutPaneProps) {
    const className = [
        'page-layout-pane',
        `page-layout-pane-${position}`,
        sticky ? 'page-layout-pane-sticky' : '',
        hidden?.narrow ? 'hide-narrow' : '',
        hidden?.regular ? 'hide-regular' : '',
        hidden?.wide ? 'hide-wide' : '',
    ].filter(Boolean).join(' ')
    
    const style = offsetHeader ? { top: `${offsetHeader}px` } : undefined
    
    return (
        <div className={className} style={style}>
            {children}
        </div>
    )
}

PageLayout.Content = PageLayoutContent
PageLayout.Pane = PageLayoutPane

export default PageLayout
