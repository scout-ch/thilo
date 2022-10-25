// import styled from '@emotion/styled'
import React, { useEffect } from 'react'
import Section, { SectionT } from '../components/Section'
import { useLocation, useParams } from 'react-router'
import { withTranslation } from 'react-i18next'

type Params = {
  slug: string
}

type SectionsByKey = {
  [key: string]: SectionT
}

type Props = {
  sections: SectionsByKey
}

function SectionPage(props: Props) {
  const { slug } = useParams<Params>()
  const section = props.sections[slug]
  const location = useLocation();

  const colors = [
    "#521d3a", "#8c3c4f", 
    "#c55931", "#c55931", 
    "#d8965a", "#e8c19a", 
    "#e0c477", "#eddbaf", 
    "#c8bca5", "#ddd5c7", 
    "#57632e", "#93966e", 
    "#a9ba9b", "#cbd3c2", 
    "#579a9e", "#a2c0c3"
    ]

  useEffect(() => {
    const hash = location.hash
    const id = hash.replace('#', '');
    if (hash) {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView()
    } else {
        const title = document.getElementById('section-title')
        if (title) title.scrollIntoView()
    }
    const section_title = document.getElementById('section-title')
    const root = document.documentElement;
    if (section_title) {
      const last_class = section_title.classList[section_title.classList.length-1]
      const sorting = parseInt(last_class[last_class.length-1]);

      root.style.setProperty('--color-primary', colors[2*(sorting-1)]);
      root.style.setProperty('--color-primary-light', colors[2*(sorting-1)+1]);

    }
  });
  if (!section) return null
  return <Section section={section} />
}
export default withTranslation()(SectionPage)
