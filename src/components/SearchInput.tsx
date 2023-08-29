import { useRef } from "react"
import { withTranslation } from "react-i18next"
import { SearchIcon, XIcon } from '@primer/octicons-react'
import { TextInput } from "@primer/react"

type Props = {
    t: any,
    keyword?: string,
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// render the search input field in the navigation bar and search page
function SearchInput(props: Props) {
    const { t, keyword, onChange, onKeyDown } = props;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const clear = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
    return <div className='search-input'>
        <div className='icon-input'>
            <TextInput
                name='search'
                placeholder={t('searchPage.searchPlaceholder')}
                defaultValue={keyword}
                onChange={onChange}
                onKeyDown={onKeyDown}
                autoFocus
                leadingVisual={SearchIcon}
                ref={inputRef}
                trailingAction={
                    <TextInput.Action
                    onClick={clear}
                    icon={XIcon}
                    aria-label="Clear input"
                    tooltipDirection="nw"
                    sx={{color: 'fg.subtle'}}
                />
            }
            />
        </div>
    </div>
}
export default withTranslation()(SearchInput)
