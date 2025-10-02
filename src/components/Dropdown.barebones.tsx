import { ReactNode, useState, useRef, useEffect } from 'react'

type DropdownProps = {
    trigger: ReactNode
    children: ReactNode
    align?: 'start' | 'end'
    className?: string
}

type DropdownItemProps = {
    children: ReactNode
    onClick?: () => void
    selected?: boolean
    disabled?: boolean
    className?: string
}

export function Dropdown({ trigger, children, align = 'start', className = '' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen])

    return (
        <div className={`dropdown ${className}`} ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            {isOpen && (
                <div className={`dropdown-menu dropdown-menu-${align}`}>
                    {children}
                </div>
            )}
        </div>
    )
}

export function DropdownItem({ children, onClick, selected, disabled, className = '' }: DropdownItemProps) {
    return (
        <button
            className={`dropdown-item ${selected ? 'dropdown-item-selected' : ''} ${disabled ? 'dropdown-item-disabled' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
            {selected && <span className="dropdown-check">✓</span>}
        </button>
    )
}

type DropdownGroupProps = {
    title?: string
    children: ReactNode
}

export function DropdownGroup({ title, children }: DropdownGroupProps) {
    return (
        <div className="dropdown-group">
            {title && <div className="dropdown-group-title">{title}</div>}
            {children}
        </div>
    )
}
