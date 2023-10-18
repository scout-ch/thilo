import React, { useEffect } from 'react';
import './globals'
import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import HomePage from './pages/HomePage';
import i18n from './i18n';
import { withTranslation } from 'react-i18next';
import Footer from './components/Footer';
import SectionPage from './pages/SectionPage';
import ImpressumPage from './pages/ImpressumPage';
import { checkLinks } from './utils/LinkChecker';
import SearchPage from './pages/SearchPage';
import client from "./client";
import { HelmetProvider } from 'react-helmet-async';

import { PageLayout, ThemeProvider } from '@primer/react'
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import { Helmet } from 'react-helmet-async';

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

  async function pullData(source: string, lang: string, setterFunc: Function) {
    const dataPromise = client.get(`/${source}?_locale=${lang}`)
    Promise.all([dataPromise]).then((values) => {
      let data = values[0].data;
      if(data.filter) {
        data = data.filter((e:any) => e.published_at !== null)
      }
      setterFunc(data)
      window.localStorage.setItem(`${source}_${lang}`, JSON.stringify(data));
      console.info(`pulled from strapi - ${source}_${lang}`)
    })
  }

  // get data from strapi or local storage if available
  // TODO: check if data is up to date
  useEffect(() => {
    // load data from local storage
    let startPageLocal = window.localStorage.getItem(`start-page_${lang}`)
    let sectionsLocal = window.localStorage.getItem(`sections_${lang}`)
    let linksLocal = window.localStorage.getItem(`links_${lang}`)
    // unless you are currently editing the data... a dev can set this in the console
    let alwaysReload = window.localStorage.getItem(`always-reload`)

    alwaysReload = 'not-null-during-dev'

    if(alwaysReload === null) {
      // parse data from local storage or pull from strapi
      if(startPageLocal !== null) {
        setStartPage(JSON.parse(startPageLocal))
        console.info('loaded from local storage - start-page')
      } else {
        pullData('start-page', lang, setStartPage);
      }
      if(sectionsLocal !== null && sectionsLocal !== '[]') {
        setSections(JSON.parse(sectionsLocal))
        setSearchPage(JSON.parse(sectionsLocal))
        console.info('loaded from local storage - sections')
      } else {
        pullData('sections', lang, setSections);
        // TODO: Is this setSearchPage call necessary?
        pullData('sections', lang, setSearchPage);
      }
      if(linksLocal !== null && linksLocal !== '[]') {
        setLinks(JSON.parse(linksLocal))
        console.info('loaded from local storage - links')
      } else {
        pullData('links', lang, setLinks);
      }
    } else {
      console.log('always reload is not null! reloading data from strapi...')
      pullData('start-page', lang, setStartPage);
      pullData('sections', lang, setSections);
      pullData('sections', lang, setSearchPage);
      pullData('links', lang, setLinks);
    }
  }, [lang])

  // disable scroll restoration
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);

  // check if data is available
  if (!sections || !links || !startPage || !searchPage) return null
  //@ts-ignore
  const sectionsByKey = sections.reduce(function (map, section: SectionT) {
    map[section.slug] = section
    return map
  }, {})

  checkLinks(sections, links)

  window.sections = sections;

  // HelmetProvider allows the use of Helmet components to set the title 
  // and, in the future, meta tags and SEO data
  return (
    <ThemeProvider colorMode='auto'>
      <HelmetProvider>
        <Helmet>
          <script defer data-domain="scout-ch.github.io/thilo" src={'https://plausible.io/js/script.js'}></script>
        </Helmet>
        <div className='App'>
          <Router basename="/">
            <LinksContext.Provider value={links}>
              <PageLayout>
                <PageLayout.Content>
                  {/* to have a sticky header, it needs to be placed here
                  in the content */}
                  <Header />
                    <main id="main-content">
                      <Routes>
                          <Route path="/search" element={<SearchPage page={searchPage} sections = {sections} />} />
                          <Route path="/impressum" element={<ImpressumPage />} />
                          <Route path="/:slug"  element={<SectionPage sections={sectionsByKey} />} />
                          <Route path="/" element={<HomePage page={startPage}/>} />
                          <Route path="/thilo/" element={ <HomePage page={startPage}/>} />
                        </Routes>
                    </main>
                </PageLayout.Content>
                <PageLayout.Pane position={'start'} sticky  //resizable
                  hidden={{narrow: true, regular: true, wide: false}}
                  // offsetHeader={64}
                >
                  <SidebarNav startPageMenuName={'start'} variant='full'/>
                </PageLayout.Pane>
                <PageLayout.Footer>
                  <Footer />

                </PageLayout.Footer>
              </PageLayout>

            </LinksContext.Provider>
          </Router>
        </div>
      </HelmetProvider>
    </ThemeProvider>
  )
}

export default withTranslation()(App);
