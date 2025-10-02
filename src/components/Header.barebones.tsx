import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link as ReactRouterLink } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { useLanguageChangeHandler } from '../i18n/LanguageChanger'

import SidebarNav from './SidebarNav.barebones'
import { Dialog } from './Dialog.barebones'
import IconButton from './IconButton.barebones'
import SearchInput from './SearchInput.barebones'
import LanguagePicker from './LanguagePicker.barebones'
import { Dropdown, DropdownItem, DropdownGroup } from './Dropdown.barebones'
import { useTheme } from './ThemeProvider.barebones'
import { ThreeBarsIcon, SearchIcon, XIcon, KebabHorizontalIcon } from './icons.barebones'

type Props = {
    t?: any
}

const Header = ({ t }: Props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
    const returnFocusRef = useRef<HTMLButtonElement>(null)
    const { width } = useWidth()
    
    const location = useLocation()
    const navigate = useNavigate()
    
    const colorSchemes = [
        {id: "auto",  name: t("header.theme_auto_name")},
        {id: "light", name: t("header.theme_light_name")},
        {id: "dark",  name: t("header.theme_dark_name")},
    ]
    
    const { colorMode, setColorMode } = useTheme()
    const [selectedColorScheme, setSelectedColorScheme] = useState(
        colorSchemes.find(s => s.id === colorMode) || colorSchemes[1]
    )

    const isSearchResultsPage = location.pathname === '/search'
    
    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const searchFieldValue = e.currentTarget.value
            const searchPageRoute = '/search'
            if (location.pathname !== searchPageRoute) {
                const location = { pathname: searchPageRoute, search: '' }
                if (searchFieldValue?.length > 0) {
                    location.search = `keyword=${searchFieldValue}`
                }
                navigate(location)
            } else {
                navigate({ search: `keyword=${searchFieldValue}` })
            }
            e.currentTarget.value = ''
            closeSidebar()
            setIsSearchOpen(false) // Close search on submit
        }
    }

    // Close sidebar on route/hash change
    useEffect(() => {
        const hashChangeHandler = () => {
            setIsSidebarOpen(false)
            setIsSearchOpen(false)
        }
        window.addEventListener('hashchange', hashChangeHandler)
        return () => {
            window.removeEventListener('hashchange', hashChangeHandler)
        }
    }, [])

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        const body = document.querySelector('body')
        if (body) {
            body.style.overflow = isSidebarOpen && width && width < 1280 ? 'hidden' : 'auto'
        }
    }, [isSidebarOpen, width])

    useLanguageChangeHandler()

    return (
        <>
            <header className="app-header">
                <div className="header-content">
                    <IconButton
                        className="hamburger-button"
                        icon={ThreeBarsIcon}
                        aria-label="Open Sidebar"
                        onClick={openSidebar}
                        ref={returnFocusRef}
                    />
                    
                    {/* Search Bar - visible on medium+ screens, toggleable on small */}
                    {!isSearchResultsPage && (
                        <div className={`search-container ${isSearchOpen ? 'search-open' : 'search-closed'}`}>
                            <SearchInput onKeyDown={onSearchKeyDown} tooltipDirection='s'/>
                        </div>
                    )}
                    
                    {/* Mobile Search Toggle - only on small screens */}
                    {!isSearchResultsPage && (
                        <IconButton
                            className={`search-toggle-open ${!isSearchOpen ? 'search-toggle-visible' : 'search-toggle-hidden'}`}
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            aria-label={isSearchOpen ? "Close Search" : "Open Search"}
                            aria-expanded={isSearchOpen ? 'true' : 'false'}
                            icon={isSearchOpen ? XIcon : SearchIcon}
                        />
                    )}
                    
                    {/* Right side menu - always anchored to the right */}
                    <div className="header-menu">
                        <Dropdown
                            trigger={
                                <IconButton
                                    className='menu-button'
                                    icon={KebabHorizontalIcon}
                                    aria-label="Open Menu"
                                />
                            }
                            align="start"
                        >
                            <DropdownGroup>
                                {width && width > 544 ? (
                                    <LanguagePicker mediumOrLower={true}/>
                                ) : (
                                    <LanguagePicker xs={true} />
                                )}
                            </DropdownGroup>
                            
                            <DropdownGroup title="Theme">
                                {colorSchemes.map(colorScheme => (
                                    <DropdownItem
                                        key={colorScheme.id}
                                        selected={colorScheme.id === selectedColorScheme.id}
                                        onClick={() => {
                                            setSelectedColorScheme(colorScheme)
                                            setColorMode(colorScheme.id as 'light' | 'dark' | 'auto')
                                        }}
                                    >
                                        {colorScheme.name}
                                    </DropdownItem>
                                ))}
                            </DropdownGroup>

                            <DropdownGroup>
                                <DropdownItem onClick={() => navigate('/impressum')}>
                                    {t('header.imprint')}
                                </DropdownItem>
                                <DropdownItem disabled>
                                    © 2024 Pfadibewegung Schweiz
                                </DropdownItem>
                            </DropdownGroup>
                        </Dropdown>
                    </div>
                </div>
            </header>

            <Dialog
                returnFocusRef={returnFocusRef}
                isOpen={isSidebarOpen}
                onDismiss={closeSidebar}
                aria-labelledby="sidebar-overlay-header"
            >
                <Dialog.Header id="sidebar-overlay-header">
                    {t('sideBarNav.title')}
                </Dialog.Header>
                <SidebarNav 
                    startPageMenuName={t('startPage.menuName')} 
                    variant="overlay" 
                />
            </Dialog>
        </>
    )
}

// Hook for getting window width
function useWidth() {
    const hasWindow = typeof window !== 'undefined'

    const getWidth = useCallback(() => {
        const width = hasWindow ? window.innerWidth : null
        return { width }
    }, [hasWindow])

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

export default withTranslation()(Header)
