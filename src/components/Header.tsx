import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IconButton } from '@primer/react'
import {
  ThreeBarsIcon,
  SearchIcon,
  XIcon,
} from '@primer/octicons-react'

import { SectionT } from './Section'
import LanguagePicker from './LanguagePicker'
import SearchInput from './SearchInput'
import SidebarNav from './SidebarNav'
import styles from './Header.module.scss'



type Props = {
    sections: Array<SectionT>
    startPageMenuName: String
}

export const Header = (props: Props) => {

  const [scroll, setScroll] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { width } = useWidth()
  const returnFocusRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  const isSearchResultsPage = location.pathname === '/search';
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const searchFieldValue = e.currentTarget.value;
        const searchPageRoute = '/search';
        // if we are not on the search page, we need to navigate to it
        if (location.pathname !== searchPageRoute) {
            const location = { pathname: searchPageRoute, search: '' }
            // if there is a search query from the nav, use it for the search link
            if (searchFieldValue?.length > 0) {
                location.search = `keyword=${searchFieldValue}`
                }
                navigate(location)
            } else {
            // if we are on the search page we can search directly
            navigate({ search: `keyword=${searchFieldValue}` })
        }
        e.currentTarget.value = '';
        // close the navbar on search
        closeSidebar();
    }
  }


  useEffect(() => {
    function onScroll() {
      setScroll(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // When the sidebar overlay is opened, prevent the main content from being
  // scrollable.
  useEffect(() => {
    const bodyDiv = document.querySelector('body div') as HTMLElement
    const body = document.querySelector('body')
    if (bodyDiv && body) {
      // The full sidebar automatically shows at the xl window size so unlock
      // scrolling if the overlay was opened and the window size is increased to xl.
      body.style.overflow = isSidebarOpen && width && width < 1280 ? 'hidden' : 'auto'
    }
  }, [isSidebarOpen, width])

  // on REST pages there are sidebar links that are hash anchor links to different
  // sections on the same page so the sidebar overlay doesn't dismiss.  we listen
  // for hash changes and close the overlay when the hash changes.
  useEffect(() => {
    const hashChangeHandler = () => {
      setIsSidebarOpen(false)
    }
    window.addEventListener('hashchange', hashChangeHandler)

    return () => {
      window.removeEventListener('hashchange', hashChangeHandler)
    }
  }, [])

  function useWidth() {
    const hasWindow = typeof window !== 'undefined'

    const getWidth = useCallback(() => {
      const width = hasWindow ? window.innerWidth : null;
      return {
        width,
      };
    }, [hasWindow]);

    const [width, setWidth] = useState(getWidth())

    useEffect(() => {
      if (hasWindow) {
        const handleResize = function () {
          setWidth(getWidth())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }
    }, [hasWindow, getWidth])

    return width
  }

  return (
    <>
      <div
        data-container="header"
        className={cx(
          'sections d-unset color-border-muted no-print z-3 color-bg-default position-sticky top-0',
          styles.header,
        )}
      >
        <header
          className={cx(
            'color-bg-default p-2 z-1 sections',
            scroll && 'color-shadow-small',
          )}
          role='banner'
          aria-label='Main'
        >
          <div className={cx('d-flex flex-items-center')}>
          <IconButton
            className="color-fg-muted border hide-xl"
            icon={ThreeBarsIcon}
            aria-label="Open Sidebar"
            onClick={openSidebar}
            ref={returnFocusRef}
          />
          <Dialog
            returnFocusRef={returnFocusRef}
            isOpen={isSidebarOpen}
            onDismiss={closeSidebar}
            aria-labelledby="menu-title"
            sx={{
              position: 'fixed',
              top: '0',
              left: '0',
              marginTop: '0',
              maxHeight: '100vh',
              width: 'auto !important',
              transform: 'none',
              borderRadius: '0',
              borderRight: '1px solid var(--color-border-default)',
            }}
          >
            <Dialog.Header
              style={{ paddingTop: '0px', background: 'none' }}
              id="sidebar-overlay-header"
              sx={{ display: 'block' }}
              >
              SidebarNav Header
            </Dialog.Header>
            <SidebarNav startPageMenuName={props.startPageMenuName} variant="overlay" />
          </Dialog>
          

          {!isSearchResultsPage && <div
              className={cx(
                isSearchOpen
                  ? styles.searchContainerWithOpenSearch
                  : styles.searchContainerWithClosedSearch,
                'mr-3 ml-auto',
              )}
            >
              <SearchInput onKeyDown={onSearchKeyDown} />
            </div>
          }
            {!isSearchResultsPage && <>
              <IconButton
                className={cx(
                  'hide-lg hide-xl',
                  !isSearchOpen ? 'd-flex flex-items-center ml-auto' : 'd-none',
                )}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Open Search Bar"
                aria-expanded={isSearchOpen ? 'true' : 'false'}
                icon={SearchIcon}
              />
              <IconButton
                className="px-3"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Close Search Bar"
                aria-expanded={isSearchOpen ? 'true' : 'false'}
                icon={XIcon}
                sx={
                  isSearchOpen
                    ? {
                        // The x button to close the small width search UI when search is open, as the
                        // browser width increases to md and above we no longer show that search UI so
                        // the close search button is hidden as well.
                        // breakpoint(md)
                        '@media (min-width: 768px)': {
                          display: 'none',
                        },
                      }
                    : {
                        display: 'none',
                      }
                }
              />
            </>
            }
            <div className={cx('d-lg-flex flex-items-center ml-3', isSearchResultsPage && 'ml-auto')}>
                <LanguagePicker />
            </div>
          </div>
        </header>
      </div>
    </>
  )
}
