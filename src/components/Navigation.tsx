import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StartPage } from '../pages/HomePage'
import { ChapterT } from './Chapter'
import SearchInput from './SearchInput'
import { SectionT } from './Section'

type Props = {
    sections: Array<SectionT>
    startPage: StartPage
}

function Navigation(props: Props) {

    const [navbarOpen, setNavbarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const sections = props.sections
    const [checkedState, setCheckedState] = useState(
        new Array(sections.length).fill(false)
    );

    const handleOnChange = (sectionNav: any, section: SectionT) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === sectionNav ? !item : false
        );
        setCheckedState(updatedCheckedState)
        navigate('/' + section.slug)
    }

    const handleToggle = () => {
        setNavbarOpen(!navbarOpen)
    }

    useEffect(() => {    
        document.getElementsByTagName('main')[0].addEventListener('scroll', function (e) {
          setNavbarOpen(false);
        });
      }, []);

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const searchFieldValue = e.currentTarget.value;
            const searchPageRoute = '/search';

            if (location.pathname !== searchPageRoute) {
                const location = { pathname: searchPageRoute, search: '' }
                if (searchFieldValue?.length > 0) {
                    location.search = `keyword=${searchFieldValue}`
                }
                navigate(location)
            } else {
                navigate({ search: `keyword=${searchFieldValue}` })
            }

            e.currentTarget.value = '';
            setNavbarOpen(false);
        }
    }

    function chapterList(section: SectionT) {
        const chapters = section.chapters
        const chapterItems = chapters.sort(function (a: ChapterT, b: ChapterT) {
            return a.sorting - b.sorting;
        }).map(function (chapter: ChapterT) {
            var isActive = location.hash.replace('#', '') === chapter.slug
            var className = isActive ? `${chapter.slug_with_section} active` : `${chapter.slug_with_section}`
            return <li key={chapter.slug_with_section} className="subMenu" onClick={handleToggle}>
                <Link to={chapter.slug_with_section} className={className}>{chapter.menu_name}</Link>
            </li>
        })
        return <ul className="accordion_sub-menu">
            {chapterItems}
        </ul>
    }

    const sectionList = sections.map(function (section: SectionT, index: number) {
        var isActive = location.pathname.replace('/', '') === section.slug
        var className = isActive ? `${section.slug} active` : `${section.slug}`
    
        return (
            <React.Fragment key={section.slug}> {/* Provide unique key prop */}
                <li key={section.slug} className={className}>
                    <input
                        type="checkbox"
                        name="tabs"
                        id={section.slug}
                        className={`accordion_input ${className}`}
                        checked={checkedState[index]}
                        onChange={() => handleOnChange(index, section)}
                    />
                    <label htmlFor={section.slug} className={`accordion_label ${className}`}>
                        {section.menu_name}
                    </label>
                    {chapterList(section)}
                </li>
            </React.Fragment>
        )
    });
    
    const startPage = props.startPage
    const isHome = location.pathname === '/'
    var classNameHome = isHome ? 'home active' : 'home'
    return <nav className="header-nav">
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
}

export default Navigation
