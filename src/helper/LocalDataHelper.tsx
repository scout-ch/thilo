

import sectionsDE from './../data/sections/sections.de.json'
import sectionsFR from './../data/sections/sections.fr.json'
import sectionsIT from './../data/sections/sections.it.json'
import linksDE from './../data/links/de.json'
import linksFR from './../data/links/fr.json'
import linksIT from './../data/links/it.json'

import startPageDE from './../data/start-page/de.json'
import startPageFR from './../data/start-page/fr.json'
import startPageIT from './../data/start-page/it.json'

import searchPageDE from './../data/search-page/de.json'
import searchPageFR from './../data/search-page/fr.json'
import searchPageIT from './../data/search-page/it.json'
import { SectionT } from '../components/Section'

export function setLocalData(lang: string, setSections: React.Dispatch<React.SetStateAction<null>>, setLinks: React.Dispatch<React.SetStateAction<null>>, setStartPage: React.Dispatch<React.SetStateAction<null>>, setSearchPage: React.Dispatch<React.SetStateAction<null>>) {
  if (lang === 'de') {
    // @ts-ignore
    setSections(sectionsDE);
    // @ts-ignore
    setLinks(linksDE);
    // @ts-ignore
    setStartPage(startPageDE);
    // @ts-ignore
    setSearchPage(searchPageDE);
  } else if (lang === 'it') {
    // @ts-ignore
    setSections(sectionsIT);
    // @ts-ignore
    setLinks(linksIT);
    // @ts-ignore
    setStartPage(startPageIT);
    // @ts-ignore
    setSearchPage(searchPageIT);
  } else if (lang === 'fr') {
    // @ts-ignore
    setSections(sectionsFR);
    // @ts-ignore
    setLinks(linksFR);
    // @ts-ignore
    setStartPage(startPageFR);
    // @ts-ignore
    setSearchPage(searchPageFR);
  }
}

export function getLocalSectionData(lang: string): SectionT[] {
  if (lang === 'de') {
    return sectionsDE
  } else if (lang === 'fr') {
    return sectionsFR
  } else if (lang === 'it') {
    return sectionsIT
  }
  return []
}
