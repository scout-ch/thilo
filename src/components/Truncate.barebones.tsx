import { ReactNode } from 'react'

type TruncateProps = {
    children: ReactNode
    title?: string
    maxWidth?: number
    className?: string
}

function Truncate({ children, title, maxWidth, className = '' }: TruncateProps) {
    const style = maxWidth ? { maxWidth: `${maxWidth}px` } : undefined
    
    return (
        <span 
            className={`truncate ${className}`}
            title={title || (typeof children === 'string' ? children : undefined)}
            style={style}
        >
            {children}
        </span>
    )
}

export default Truncate
