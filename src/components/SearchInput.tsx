import { useRef } from "react"
import { withTranslation } from "react-i18next"
import { SearchIcon, XIcon } from '@primer/octicons-react'
import { IconButton, TextInput } from "@primer/react"

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
    

    return <div className="position-relative">
        <form
          role="search"
          className="width-full d-flex"
          onSubmit={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
            console.log(inputRef.current)
            // FIXME: Enter keydown does not seem to reach the input.
            inputRef.current?.dispatchEvent(new KeyboardEvent('keypress', {
                key: 'Enter',
              }));
        
          }}
        >
    <meta name="viewport" content="width=device-width initial-scale=1" />
    <label className="text-normal width-full">
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
    <IconButton
      aria-label="Search"
      icon={SearchIcon}
      sx={{ borderTopLeftRadius: 'unset', borderBottomLeftRadius: 'unset' }}
    />
</form>
</div>
}
export default withTranslation()(SearchInput)
