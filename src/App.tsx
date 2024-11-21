import React, { useEffect } from 'react';
import './globals'
import {
  BrowserRouter as Router,
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
import NoMatch from './pages/NoMatch';
import client from "./client";
import { HelmetProvider } from 'react-helmet-async';

import { PageLayout, ThemeProvider } from '@primer/react'
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import { Helmet } from 'react-helmet-async';

import { slugify } from "modern-diacritics";

import { ChapterT } from './components/Chapter';
import { SectionT } from './components/Section';
export type LinkT = {
  title: string
  link: string | undefined
  key: string
  slug: string | null
}

export const LinksContext = React.createContext<LinkT[]>([])

function App() {
  const [data, setData] = React.useState(null);
  const [sections, setSections] = React.useState(null);
  const [links, setLinks] = React.useState(null);
  const [startPage, setStartPage] = React.useState(null);
  const [searchPage, setSearchPage] = React.useState(null);
  const lang = i18n.language

  //Importing your data 
  const rawImport = import.meta.glob(`../exports/*.json`)

  async function parseLocalData(setDataFunction: Function) {
    let imported: { [x: string]: unknown; }[] = []
    for (const path in rawImport) {
      await rawImport[path]().then((mod) => { 
        let name = path.replace('../exports/', '').replace('.json', '')
        //@ts-ignore
        imported.push({[name]: mod.default})
      })
    }
    setDataFunction(imported)
  }

  async function pullData(source: string, lang: string, setterFunc: Function) {
    const dataPromise = client.get(`/${source}?_locale=${lang}`)
    Promise.all([dataPromise]).then((values) => {
      let data = values[0].data;
      if(data.filter) {
        data = data.filter((e:any) => e.published_at !== null)
      }
      setterFunc(data)
      window.localStorage.setItem(`${source}-${lang}`, JSON.stringify(data));
      console.info(`pulled from strapi - ${source}-${lang}`)
    })
  }

  // get data from strapi or local storage if available
  // TODO: check if data is up to date
  function oldDataSolution() {
  // load data from local storage
  let startPageLocal = window.localStorage.getItem(`start-page-${lang}`)
  let sectionsLocal = window.localStorage.getItem(`sections-${lang}`)
  let linksLocal = window.localStorage.getItem(`links-${lang}`)
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
}

  useEffect(() => {
    parseLocalData(setData);
  }, [lang])

  useEffect(() => {
    if(data) {
      console.log('setting local data', data);
      (data as any[]).forEach((d) => {
        let key = Object.keys(d)[0]
        console.log('set', key)
        localStorage.setItem(key, JSON.stringify(d[key]))
        if (key.includes(lang)) {
          if(key.includes('links')) {
            setLinks(d[key]);
          } else if(key.includes('start-page')) {
            setStartPage(d[key]);
          } else if(key.includes('sections')) {
            let sections = d[key];
            setSections(sections);
            setSearchPage(sections);
            window.sections = sections;
          }
        }
      })
    }
  }, [data, lang])

  // disable scroll restoration
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);

  // TODO: REMOVE THIS, MOVE TO LOCAL DATA ONLY
  if (!data) {
    oldDataSolution()
  }

  // check if data is available
  if (!sections || !links || !startPage || !searchPage) return null
  //@ts-ignore
  const sectionsByKey = sections.reduce(function (map, section: SectionT) {
    section.slug = slugify(section.title, {forceSingleSpace: true, trim: true})
    section.chapters = section.chapters.map(function (chapter: ChapterT) {
      chapter.slug = slugify(chapter.title, {forceSingleSpace: true, trim: true})
      chapter.slug_with_section = `${section.slug}#${chapter.slug}`
      return chapter
    });
    map[section.slug] = section
    return map
  }, {});

  checkLinks(sections, links)

  window.sections = sections;

  // HelmetProvider allows the use of Helmet components to set the title 
  // and, in the future, meta tags and SEO data
  return (
    <ThemeProvider colorMode='light'>
      <HelmetProvider>
        <Helmet>
          <script defer data-domain="thilo.scouts.ch" src={'https://plausible.io/js/script.js'}></script>
        </Helmet>
        <div className='App'>
          <Router basename={import.meta.env.BASE_URL}>
            <LinksContext.Provider value={links}>
              <Header />
              <PageLayout sx={{padding: '0'}}>
                <PageLayout.Content>
                  <div id="main-content" className='p-3'>
                    <Routes>
                        <Route path="/" element={<HomePage page={startPage}/>} />
                        <Route path="/thilo/" element={ <HomePage page={startPage}/>} />
                        <Route path="/search" element={<SearchPage page={searchPage} sections = {sections} />} />
                        <Route path="/impressum" element={<ImpressumPage />} />
                        {/* TODO: currently, 404 page is called by Section component because otherwise won't work */}
                        <Route path="/:slug"  element={<SectionPage sections={sectionsByKey}/>} />
                        {/* TODO: Below does not really do anyting, because :slug matches everything */}
                        <Route path="*" element={<NoMatch />} />
                      </Routes>
                    <Footer />
                  </div>
                </PageLayout.Content>
                <PageLayout.Pane position={'start'} sticky  //resizable
                  hidden={{narrow: true, regular: true, wide: false}}
                  offsetHeader={64}
                >
                  <SidebarNav startPageMenuName={'start'} variant='full'/>
                </PageLayout.Pane>
              </PageLayout>

            </LinksContext.Provider>
          </Router>
        </div>
      </HelmetProvider>
    </ThemeProvider>
  )
}

export default withTranslation()(App);
