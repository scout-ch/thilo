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

  React.useEffect(() => {
    const sectionsPromise = client.get('/sections?_sort=sorting:ASC&_locale=' + lang)
    const linksPromise = client.get('/links?_locale=' + lang)
    const startPagePromise = client.get('/start-page?_locale=' + lang)

    Promise.all([sectionsPromise, linksPromise, startPagePromise]).then((values) => {
      setSections(values[0].data)
      setSearchPage(values[0].data)
      setLinks(values[1].data)
      setStartPage(values[2].data)
    })
  }, [lang])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);

  library.add(faExclamationTriangle, faBars, faSearch)

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
