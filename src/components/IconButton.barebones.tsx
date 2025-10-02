import { ReactNode, forwardRef } from 'react'

type IconButtonProps = {
    icon: () => JSX.Element
    'aria-label': string
    onClick?: () => void
    className?: string
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon: Icon, 'aria-label': ariaLabel, onClick, className = '' }, ref) => {
        return (
            <button
                ref={ref}
                className={`icon-button ${className}`}
                onClick={onClick}
                aria-label={ariaLabel}
                type="button"
            >
                <Icon />
            </button>
        )
    }
)

IconButton.displayName = 'IconButton'

export default IconButton
