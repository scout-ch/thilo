import { useRef } from "react"
import { withTranslation } from "react-i18next"
import { SearchIcon } from '@primer/octicons-react'
import { IconButton, TextInput, Tooltip } from "@primer/react"

type Props = {
    t?: any,
    keyword?: string,
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    tooltipDirection?: 's' | 'n'
}

// render the search input field in the navigation bar and search page
function SearchInput({ t, keyword, onChange, onKeyDown, tooltipDirection }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    

    return <div className="position-relative ">
        <form
          role="search"
          className="d-flex"
          onSubmit={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
            // console.log(inputRef.current)
            // FIXME: Enter keydown does not seem to reach the input.
            inputRef.current?.dispatchEvent(new KeyboardEvent('keypress', {
                key: 'Enter',
              }));
        
          }}
        >
    <meta name="viewport" content="width=device-width initial-scale=1" />
    <label className="text-normal ">
      <span
        className="visually-hidden"
      >{t('searchPage.searchPlaceholder')}</span>
      <TextInput
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
        // className="color-bg-transparent color-fg-muted"
        sx={{
          width: '100%',
          height: '2rem',
          transition: 'width 0.3s ease-in-out',
          borderBottomRightRadius: 'unset',
          borderTopRightRadius: 'unset',
          borderRight: 'none',
        }}
      />
    </label>
    <Tooltip aria-label={t("searchPage.tooltip")} direction={tooltipDirection? tooltipDirection : 'n'}>
      <IconButton
      className="AppHeader-button color-fg-muted"
        aria-label={t("searchPage.tooltip")}
        icon={SearchIcon}
        sx={{ borderTopLeftRadius: 'unset', borderBottomLeftRadius: 'unset' }}
      />
    </Tooltip>
</form>
</div>
}
export default withTranslation()(SearchInput)
