import React from 'react'
import { useLocation } from 'react-router-dom'
import type { ChapterT } from './Chapter'
import type { SectionT } from './Section'

import { NavList, Truncate} from '@primer/react'
import cx from 'classnames'

import { HomeIcon, AppsIcon } from '@primer/octicons-react'


type Props = {
    sections: Array<SectionT>
    startPageMenuName?: String
    variant?: 'full' | 'overlay'
}

function SidebarNav(props: Props) {

    // location and navigate for browsing sections and chapters via hash links
    const location = useLocation()
    const sections = props.sections
    /*
    // state for the navbar to be open or closed
    const [navbarOpen, setNavbarOpen] = useState(false)
    const navigate = useNavigate()

    // checked state for the dropdown menu to signify current section and chapter
    const [checkedState, setCheckedState] = useState(
        new Array(sections.length).fill(false)
    );

    // if navbar changes: check the current section and set the checked state 
    const handleOnChange = (sectionIndex: any, section: SectionT, redirect: boolean=true) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === sectionIndex ? true : false
        );
        setCheckedState(updatedCheckedState)
        if(redirect) navigate('/' + section.slug);
    }
    // for clicks on outer menu list markers, toggle the checked state
    const handleLiMarkerOnClick = (sectionIndex: number) => {
        return (event: React.MouseEvent) => {
            if(event.target instanceof HTMLLIElement) {
                const updatedCheckedState = checkedState.map((item, index) =>
                    index === sectionIndex ? !item : item
                );
                setCheckedState(updatedCheckedState)
            }
        }
    }
    
    // toggle the navbar open and closed
    const handleToggle = () => {
        setNavbarOpen(!navbarOpen)
    }
    
    // close the navbar when scrolling
    useEffect(() => {
        window.addEventListener('scroll', function (e) {
            setNavbarOpen(false);
        });
    }, []);
    */

    // get sorted chapters for current section, mark current chapter
    /*
    function chapterList(section: SectionT) {
        const chapters = section.chapters
        const sectionIndex = sections.findIndex((s: SectionT) => s.sorting === section.sorting)
        const chapterItems = chapters.sort(function (a: ChapterT, b: ChapterT) {
            return a.sorting - b.sorting;
        }).map(function (chapter: ChapterT) {
            var isActive = location.hash.replace('#', '') === chapter.slug
            var className = isActive ? `${chapter.slug_with_section} active` : `${chapter.slug_with_section}`
            return <li key={chapter.slug_with_section} className="subMenu" onMouseUp={() => {handleOnChange(sectionIndex, section, false); handleToggle() } }>
                <Link to={chapter.slug_with_section} className={className}>{chapter.menu_name}</Link>
            </li>
        })
        return <ul className="accordion_sub-menu">
            {chapterItems}
        </ul>
    }

    // get the sections, mark the current section
    const sectionList = sections.map(function (section: SectionT, index: number) {
        var isActive = location.pathname.replace('/', '') === section.slug
        var className = isActive ? `${section.slug} active` : `${section.slug}`
    
        var id = 'nav_li_'+section.slug

        return (
            <React.Fragment key={section.slug}>
                <li className={className} onClick={handleLiMarkerOnClick(index)}>
                    <input
                        type="checkbox"
                        name="tabs"
                        id={id}
                        className={`accordion_input ${className}`}
                        checked={checkedState[index]}
                        onChange={() => handleOnChange(index, section)}
                    />
                    <label htmlFor={id} className={`accordion_label ${className}`}>
                        {section.menu_name}
                    </label>
                    {chapterList(section)}
                </li>
            </React.Fragment>
        )
    });
    */
    
    const sectionListNavItems = sections.map(function (section: SectionT, index: number) {
        var sectionActive = location.pathname.replace('/', '') === section.slug
        
        /*
        var link = '/#/'+section.slug
        var id = 'nav_li_'+section.slug
        const sectionIndex = sections.findIndex((s: SectionT) => s.sorting === section.sorting)
        */

        const chapters = section.chapters
        const chapterNavItems = chapters.sort(function (a: ChapterT, b: ChapterT) {
            return a.sorting - b.sorting;
        }).map(function (chapter: ChapterT) {
            var isActive = location.hash.replace('#', '') === chapter.slug
            return (
                <NavList.Item href={(`/#/${chapter.slug_with_section}`)} 
                    className={cx('ml-4', `${chapter.slug_with_section}`)} 
                    aria-current={isActive && "page"}
                >
                    {chapter.menu_name}
                </NavList.Item>
            )
        })

        return (
            <NavList.Item className={section.slug} href={('/#/'+section.slug)} aria-current={sectionActive && "page"}>
                <NavList.LeadingVisual><AppsIcon/></NavList.LeadingVisual>
                <Truncate title={section.menu_name} as='span' maxWidth={200}>{section.menu_name}</Truncate>
                {chapterNavItems.length > 0 && 
                    <NavList.SubNav>
                        {chapterNavItems}
                    </NavList.SubNav>
                }
            </NavList.Item>
            
        )
    });

    const isHome = location.pathname === '/'
    // special case for the home page which is not a section
    var classHome = isHome ? 'home active' : 'home' 
    const variant = props.variant;

    return (
        <div data-container="nav"
            className={cx(variant === 'full' ? 'position-sticky border-right d-xxl-block' : '')}
            style={{ width: 326, height: 'calc(100vh - 65px)', top: '165px' }}
        >
            <NavList className={cx('mt-8')}>
                <NavList.Item href='/' className={classHome}>
                    <NavList.LeadingVisual><HomeIcon/></NavList.LeadingVisual> Home
                </NavList.Item>
                {sectionListNavItems}
            </NavList>
            <div
            className={cx(
            variant === 'overlay' ? 'd-xxl-none' : 'border-right d-none d-xxl-block',
            'bg-primary overflow-y-auto flex-shrink-0',
            )}
            style={{ width: 326, height: 'calc(100vh - 175px)', paddingBottom: '250px' }}
            >
            </div>
        </div>
    )
    /*
    <nav className="header-nav">
        <div className="toggle-btn">
            <i onClick={handleToggle}><FontAwesomeIcon icon="bars" /></i>
        </div>
        <div className={`header-nav-content ${navbarOpen ? "showMenu" : ""}`}>
            <SearchInput onKeyDown={onSearchKeyDown} />
            <ul className={`menuItems ${navbarOpen ? "showMenu" : ""}`}>
                <li key="home" className={classNameHome}>
                    <Link to="/" className={classNameHome}>{startPage.menu_name}</Link>
                </li>
                {sectionList}
            </ul>
        </div>
    </nav>
    */
}

export default SidebarNav
