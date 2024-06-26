import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link as ReactRouterLink } from 'react-router-dom'
import cx from 'classnames'
import { ActionList, ActionMenu, Dialog, IconButton, useTheme } from '@primer/react'
import {
  ThreeBarsIcon,
  SearchIcon,
  XIcon,
  KebabHorizontalIcon
} from '@primer/octicons-react'

import LanguagePicker from './LanguagePicker'
import SearchInput from './SearchInput'
import SidebarNav from './SidebarNav'
import styles from './Header.module.scss'
import { withTranslation } from 'react-i18next'
import { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider'

import { useLanguageChangeHandler } from '../i18n/LanguageChanger'

type Props = {
    t?: any
}

const Header = ({ t }: Props) => {
  const [scroll, setScroll] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { width } = useWidth()
  const returnFocusRef = useRef(null)

  const colorSchemes = [
    {id: "auto",  name: t("header.theme_auto_name")},
    {id: "light", name: t("header.theme_light_name")},
    {id: "dark",  name: t("header.theme_dark_name")},
  ]
  const {setColorMode} = useTheme();

  const [selectedColorScheme, setSelectedColorScheme] = useState(colorSchemes[1])

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
    const body = document.querySelector('body');
    body?.setAttribute('data-color-mode', selectedColorScheme.id)
  }, [selectedColorScheme.id])


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

  useLanguageChangeHandler();

  return (
    <>
        <header
          className={cx(
            'AppHeader',
            'z-1 sections position-sticky top-0',
            // scroll && 'color-shadow-small',
          )}
          role='banner'
          aria-label='Main'
        >
          <div className={cx('d-flex flex-items-center p-3')}>
          <IconButton
            className={cx(
              "AppHeader-button hide-xxl mr-3 color-fg-muted",
            )}
            icon={ThreeBarsIcon}
            aria-label="Open Sidebar"
            onClick={openSidebar}
            ref={returnFocusRef}
            sx={
              isSearchOpen ? {
                // make sure search doesn't squash the button too much, hide it
                    '@media (max-width: 400px)': {
                      display: 'none',
                    },
                  }: { }
                }
          />
          <Dialog
            returnFocusRef={returnFocusRef}
            isOpen={isSidebarOpen}
            onDismiss={closeSidebar}
            aria-labelledby="sidebar-overlay-header"
            className='
            rounded-0 rounded-right-3 position-fixed top-0 left-0
            '
            sx={{
              marginTop: '0',
              maxHeight: '100vh !important',
              height: '100vh',
              width: 'auto !important',
              transform: 'none',
              overflow: 'auto',
            }}
          >
            <Dialog.Header
              id="sidebar-overlay-header"
              >
              {t('sideBarNav.title')}
            </Dialog.Header>
            <SidebarNav startPageMenuName={t('startPage.menuName')} variant="overlay" />
          </Dialog>
          

          {!isSearchResultsPage && <div
              className={cx(
                isSearchOpen
                  ? styles.searchContainerWithOpenSearch
                  : styles.searchContainerWithClosedSearch,
                'mr-3 ml-auto',
              )}
            >
              <SearchInput onKeyDown={onSearchKeyDown} tooltipDirection='s'/>
            </div>
          }
            {!isSearchResultsPage && <>
              <IconButton
                className={cx(
                  'hide-lg hide-xl AppHeader-button color-fg-muted',
                  !isSearchOpen ? 'd-flex flex-items-center ml-auto' : 'd-none',
                )}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Open Search Bar"
                aria-expanded={isSearchOpen ? 'true' : 'false'}
                icon={SearchIcon}
              />
              <IconButton
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Close Search Bar"
                aria-expanded={isSearchOpen ? 'true' : 'false'}
                icon={XIcon}

                className='show AppHeader-button color-fg-muted'
                sx={
                  isSearchOpen
                    ? {
                        // The x button to close the small width search UI when search is open, as the
                        // browser width increases to md and above we no longer show that search UI so
                        // the close search button is hidden as well.
                        // breakpoint(md)
                        // same as: .hide-sm .hide-md
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
            <div className={isSearchResultsPage? 'ml-auto' : ''}>
              {/* <div className={cx('d-none d-lg-flex flex-items-center')}>
                <LanguagePicker />
              </div> */}

              {/* The ... navigation menu */}
              <div className='dotdotdot-nav'>
                <ActionMenu aria-labelledby="sidebar-overlay-header">
                  <ActionMenu.Anchor>
                    <IconButton
                      className='AppHeader-button color-fg-muted'
                      icon={KebabHorizontalIcon}
                      aria-label="Open Menu"
                      sx={
                        isSearchOpen
                          ? // The ... menu button when the smaller width search UI is open.  Since the search
                            // UI is open, we don't show the button at smaller widths but we do show it as
                            // the browser width increases to md, and then at lg and above widths we hide
                            // the button again since the pickers and sign-up button are shown in the header.
                            {
                              marginLeft: '8px',
                              display: 'none',
                              // breakpoint(md)
                              '@media (min-width: 768px)': {
                                display: 'inline-block',
                                marginLeft: '4px',
                              },
                              // breakpoint(lg)
                              '@media (min-width: 1012px)': {
                                display: 'none',
                              },
                            }
                          : // The ... menu button when the smaller width search UI is closed, the button is
                            // shown up to md.  At lg and above we don't show the button since the pickers
                            // and sign-up button are shown in the header.
                            {
                              marginLeft: '16px',
                              '@media (min-width: 768px)': {
                                marginLeft: '0',
                              },
                              '@media (min-width: 1012px)': {
                                display: 'inline-block', // display: 'none' to hide on bigger screens!
                              },
                            }
                      }
                    />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay align="start" 
                  >
                    <ActionList>
                      <ActionList.Group>
                        {width && width > 544 ? (
                          <LanguagePicker mediumOrLower={true}/>
                        ) : (
                          <LanguagePicker xs={true} />
                        )}
                      </ActionList.Group>
                      <ActionMenu>
                        <ActionMenu.Button
                          className='width-full'
                          sx={{
                            textAlign: 'left',
                            'span:first-child': { display: 'inline' },
                          }}
                        >
                          Theme: {selectedColorScheme.name}
                        </ActionMenu.Button>
                        <ActionMenu.Overlay>
                          <ActionList selectionVariant="single"
                          >
                            {colorSchemes.map(colorScheme => (
                              <ActionList.Item
                                key={colorScheme.id}
                                selected={colorScheme.id === selectedColorScheme.id}
                                onSelect={() => {setSelectedColorScheme(colorScheme); setColorMode(colorScheme.id as SetStateAction<ColorModeWithAuto>)}}
                              >
                                {colorScheme.name}
                              </ActionList.Item>
                            ))}
                          </ActionList>
                        </ActionMenu.Overlay>
                      </ActionMenu>

                      <ActionList.Group>
                        <ActionList.Item as={ReactRouterLink} to="/impressum"
                          >
                          {t('header.imprint')}
                        </ActionList.Item>
                        <ActionList.Item disabled>
                          © 2024 Pfadibewegung Schweiz
                        </ActionList.Item>
                      </ActionList.Group>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </div>
            </div>
          </div>
        </header>
    </>
  )
}

export default withTranslation()(Header);