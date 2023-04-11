import React, { useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { faExclamationTriangle, faBars, faSearch } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import HomePage from './pages/HomePage';
import i18n from './i18n';
import { withTranslation } from 'react-i18next';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SectionPage from './pages/SectionPage';
import ImpressumPage from './pages/ImpressumPage';
import { checkLinks } from './helper/LinkChecker';
import SearchPage from './pages/SearchPage';
import client from "./client";

export type LinkT = {
  title: string
  link: string | undefined
  key: string
  slug: string | null
}

export const LinksContext = React.createContext<LinkT[]>([])

function App() {

  const [sections, setSections] = React.useState(null);
  const [links, setLinks] = React.useState(null);
  const [startPage, setStartPage] = React.useState(null);
  const [searchPage, setSearchPage] = React.useState(null);
  const lang = i18n.language


  // get data from strapi or local storage if available
  // TODO: check if data is up to date
  useEffect(() => {
    let startPageLocal = window.localStorage.getItem(`startPage-${lang}`)
    let sectionsLocal = window.localStorage.getItem(`sections-${lang}`)
    let linksLocal = window.localStorage.getItem(`links-${lang}`)
    
    if(startPageLocal !== null) {
      setStartPage(JSON.parse(startPageLocal))
      console.info('loaded from local storage - startPage')
    } else {
      const startPagePromise = client.get('/start-page?_locale=' + lang)
      Promise.all([startPagePromise]).then((values) => {
        setStartPage(values[0].data)
        window.localStorage.setItem(`startPage-${lang}`, JSON.stringify(values[0].data));
        console.info('pulled from strapi - startPage')
      })
    }
    if(sectionsLocal !== null && sectionsLocal !== '[]') {
      setSections(JSON.parse(sectionsLocal))
      setSearchPage(JSON.parse(sectionsLocal))
      console.info('loaded from local storage - sections')
    } else {
      const sectionsPromise = client.get('/sections?_sort=sorting:ASC&_locale=' + lang)
      Promise.all([sectionsPromise]).then((values) => {
        setSections(values[0].data)
        setSearchPage(values[0].data)
        window.localStorage.setItem(`sections-${lang}`, JSON.stringify(values[0].data));
        console.info('pulled from strapi - sections')
      })
    }
    if(linksLocal !== null && linksLocal !== '[]') {
      setLinks(JSON.parse(linksLocal))
      console.info('loaded from local storage - links')
    } else {
      const linksPromise = client.get('/links?_locale=' + lang)
      Promise.all([linksPromise]).then((values) => {
        setLinks(values[0].data)
        window.localStorage.setItem(`links-${lang}`, JSON.stringify(values[0].data));
        console.info('pulled from strapi - links')
      })
    }
  }, [lang])

  // disable scroll restoration
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);

  // add font awesome icons
  library.add(faExclamationTriangle, faBars, faSearch)

  // check if data is available
  if (!sections || !links || !startPage || !searchPage) return null
  //@ts-ignore
  const sectionsByKey = sections.reduce(function (map, section: SectionT) {
    map[section.slug] = section
    return map
  }, {})

  checkLinks(sections, links)

  return <div className='App'>
    <Router basename="/">
      <LinksContext.Provider value={links}>
        <header>
          <Navigation sections={sections} startPage={startPage}></Navigation>
        </header>

        <main>
          <Routes>
            <Route path="/search" element={<SearchPage page={searchPage} sections = {sections} />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/:slug"  element={<SectionPage sections={sectionsByKey} />} />
            <Route path="/" element={<HomePage page={startPage}/>
            } />
            <Route path="/thilo/" element={ <HomePage page={startPage}/>} />
          </Routes>

        </main>
        <footer>
          <Footer lang={lang} sections={sections} />
        </footer>

      </LinksContext.Provider>
    </Router>
  </div>
}

export default withTranslation()(App);
