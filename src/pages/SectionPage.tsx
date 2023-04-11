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

// Section pages include section components
function SectionPage(props: Props) {
  const { slug } = useParams<Params>()
  const section = props.sections[slug!]
  const location = useLocation();

  // scroll to chapter if hash in url is set
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
  });
  if (!section) return null
  return <Section section={section} />
}
export default withTranslation()(SectionPage)
