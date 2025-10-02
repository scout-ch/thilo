import { useRef } from "react"
import { withTranslation } from "react-i18next"
import { SearchIcon } from './icons.barebones'
import IconButton from './IconButton.barebones'

type Props = {
    t?: any,
    keyword?: string,
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    tooltipDirection?: 's' | 'n'
}

// render the search input field in the navigation bar and search page
function SearchInput({ t, keyword, onChange, onKeyDown, tooltipDirection }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    
    return (
        <div className="search-input-container">
            <form
                role="search"
                className="search-form"
                onSubmit={(event) => {
                    event.preventDefault()
                    inputRef.current?.focus()
                    inputRef.current?.dispatchEvent(new KeyboardEvent('keypress', {
                        key: 'Enter',
                    }))
                }}
            >
                <meta name="viewport" content="width=device-width initial-scale=1" />
                <label className="search-label">
                    <span className="visually-hidden">
                        {t('searchPage.searchPlaceholder')}
                    </span>
                    <input
                        name="search"
                        className="search-input"
                        defaultValue={keyword}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        ref={inputRef}
                        required
                        onInvalid={(e) =>
                            (e.target as HTMLInputElement).setCustomValidity('Please enter a search query.')
                        }
                        type="search"
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        placeholder={t('searchPage.searchPlaceholder')}
                        maxLength={512}
                    />
                </label>
                <button
                    type="submit"
                    className="search-button"
                    aria-label={t("searchPage.tooltip")}
                    title={t("searchPage.tooltip")}
                >
                    <SearchIcon />
                </button>
            </form>
        </div>
    )
}

export default withTranslation()(SearchInput)
