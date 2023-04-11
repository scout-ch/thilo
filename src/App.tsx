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

    if(window.localStorage.getItem('startPage')) {
      setStartPage(JSON.parse(window.localStorage.getItem('startPage') || ''))
    }
    if(window.localStorage.getItem('sections')) {
      setSections(JSON.parse(window.localStorage.getItem('sections') || ''))
    }
    if(window.localStorage.getItem('links')) {
      setLinks(JSON.parse(window.localStorage.getItem('links') || ''))
    }

    if(sections && links && startPage && searchPage) return

    if(startPage === '' || startPage === null) {
      const startPagePromise = client.get('/start-page?_locale=' + lang)
      Promise.all([startPagePromise]).then((values) => {
        setStartPage(values[0].data)
      })
    }

    if(sections === '' || sections === null || links === '' || links === null) {
      const sectionsPromise = client.get('/sections?_sort=sorting:ASC&_locale=' + lang)
      const linksPromise = client.get('/links?_locale=' + lang)
      Promise.all([sectionsPromise, linksPromise]).then((values) => {
        setSections(values[0].data)
        setSearchPage(values[0].data)
        setLinks(values[1].data)
      })
    }

  }, [lang])

  // save data to local storage
  useEffect(() => {
    window.localStorage.setItem('startPage', JSON.stringify(startPage));
    window.localStorage.setItem('sections', JSON.stringify(sections));
    window.localStorage.setItem('links', JSON.stringify(links));
  }, [sections, links, startPage, searchPage])

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
