import { useEffect, useRef, ReactNode } from 'react'

type DialogProps = {
    isOpen: boolean
    onDismiss: () => void
    children: ReactNode
    'aria-labelledby'?: string
    returnFocusRef?: React.RefObject<HTMLElement>
}

type DialogHeaderProps = {
    id?: string
    children: ReactNode
}

export function Dialog({ isOpen, onDismiss, children, 'aria-labelledby': ariaLabelledBy, returnFocusRef }: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when dialog is open
            document.body.style.overflow = 'hidden'
            
            // Focus trap
            const focusableElements = dialogRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstElement = focusableElements?.[0] as HTMLElement
            firstElement?.focus()

            // Handle escape key
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onDismiss()
                }
            }
            document.addEventListener('keydown', handleEscape)

            return () => {
                document.body.style.overflow = 'auto'
                document.removeEventListener('keydown', handleEscape)
                // Return focus to the element that opened the dialog
                returnFocusRef?.current?.focus()
            }
        }
    }, [isOpen, onDismiss, returnFocusRef])

    if (!isOpen) return null

    return (
        <div className="dialog-overlay">
            <div 
                className="dialog-backdrop" 
                onClick={onDismiss}
                aria-hidden="true"
            />
            <div 
                ref={dialogRef}
                className="dialog-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                {children}
            </div>
        </div>
    )
}

function DialogHeader({ id, children }: DialogHeaderProps) {
    return (
        <div className="dialog-header" id={id}>
            <h2 className="dialog-title">{children}</h2>
        </div>
    )
}

Dialog.Header = DialogHeader
