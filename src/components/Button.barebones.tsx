import { ReactNode, forwardRef } from 'react'

type ButtonProps = {
    children: ReactNode
    onClick?: () => void
    className?: string
    leadingIcon?: () => JSX.Element
    trailingIcon?: () => JSX.Element
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, onClick, className = '', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, disabled, type = 'button' }, ref) => {
        return (
            <button
                ref={ref}
                className={`btn ${className}`}
                onClick={onClick}
                disabled={disabled}
                type={type}
            >
                {LeadingIcon && (
                    <span className="btn-icon btn-icon-leading">
                        <LeadingIcon />
                    </span>
                )}
                <span className="btn-content">{children}</span>
                {TrailingIcon && (
                    <span className="btn-icon btn-icon-trailing">
                        <TrailingIcon />
                    </span>
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
