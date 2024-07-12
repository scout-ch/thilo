import React, { useEffect } from 'react'
import Section from '../components/Section'
import type { SectionT } from '../components/Section'
import { useLocation, useParams } from 'react-router'
import { withTranslation } from 'react-i18next'
import NoMatch from './NoMatch'

type Params = {
  slug: string
}

type SectionsByKey = {
  [key: string]: SectionT
}

type Props = {
  sections: SectionsByKey
}

// Section pages include section components
function SectionPage(props: Props) {
  const { slug } = useParams<Params>()
  const section = props.sections[slug!]
  const location = useLocation();

  // scroll to chapter if hash in url is set
  useEffect(() => {
    const hash = location.hash
    const id = hash.replace('#', '');
    if (hash && id) {
        const element = document.getElementById(id)?.getElementsByTagName('h2')[0];
        if (element) element.scrollIntoView()
    } else {
        const title = document.getElementById('section-title')?.getElementsByTagName('h1')[0]
        if (title) title.scrollIntoView()
    }
  });
  // TODO: rethink the routing so a 404 page does not have to be serve here, but in App.tsx
  if (!section) return <NoMatch />
  return <Section section={section} />
}
export default withTranslation()(SectionPage)
