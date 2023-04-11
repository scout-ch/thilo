import React from 'react'
import { ReactComponent as PBSLogo } from './../images/pbs_logo.svg'
import styled from '@emotion/styled';
import i18n from './../i18n';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SectionT } from './Section';
import client from "./../client";

type Props = {
  lang: string
  sections: SectionT[]
}

function Footer(props: Props) {
  const navigate = useNavigate();
  const changeLanguage = (lang: string, location: any, oldSections: SectionT[]) => {
    let redirect = false
    const path = location.pathname.replace('/', '')
    const currentSection = oldSections.find((s) => { return s['slug'] === path })
    i18n.changeLanguage(lang).then((_t) => {
      if (path === 'impressum') {
        redirect = true
        return
      }
      client.get('/sections?_sort=sorting:ASC&_locale=' + lang).then((response: { data: any }) => {
        const newSections = props.sections
        if (currentSection) {
          const otherSection = currentSection['localizations'].find((l: any) => { return l.locale === lang })
          // @ts-ignore
          if(newSections && otherSection) {
            const newCurrentSection = newSections.find((s: any) => { return s['id'] === otherSection['id'] })
            if (newCurrentSection) {
              redirect = true
              navigate('/' + newCurrentSection.slug)
            }
          }
        }
      }).finally(() => {
        if (!redirect) {
          navigate('/')
        }
      })
    });
  }
  const location = useLocation();
  var currentSection = location.pathname.replace('/', '');
  // console.log(currentSection, currentChapter, props.sections)
  var prevSection = '', nextSection = '';
  if(currentSection) {
    for(let i = 0; i < props.sections.length; i++) {
      if(props.sections[i].title === currentSection) {
        if(i>0) {
          prevSection = props.sections[i-1].title;
        }
        if(i<props.sections.length-1) {
          nextSection = props.sections[i+1].title;
        }
      }
    }
  } else if(props.sections[0]) { 
    // if no props.sections[0] then we can't access the section titles
    nextSection = props.sections[0].title;
    prevSection = props.sections[props.sections.length-1].title;
  }
  let prevButtonText = "Previous Chapter";
  let nextButtonText = "Next Chapter";
  let homeButtonText = "Return to Start";
  if (props.lang === 'de') {
    prevButtonText = "Vorheriges Kapitel";
    nextButtonText = "Nächstes Kapitel";
    homeButtonText = "Zurück zum Start";
  } else if (props.lang === 'fr') {
    prevButtonText = "Chapitre Précédent";
    nextButtonText = "Chapitre Suivant";
    homeButtonText = "Retour au Début";
  } else if (props.lang === 'it') {
    prevButtonText = "Capitolo Precedente";
    nextButtonText = "Prossimo Capitolo";
    homeButtonText = "Ritorno all' Inizio";
  }

  return <>
    <div className="footer-content">
      <nav className="footer-nav">
        <div className='footer-logo'><PBSLogo></PBSLogo></div>
        <ul>
          <li>
            <button className='btn-nav btn-footer' onClick={() => navigate(`/${prevSection}`)}>
              {prevSection.length > 0 &&
                <>{prevButtonText}<br/><i>{prevSection}</i></>
              }
              {prevSection.length === 0 &&
                <>{homeButtonText}<br/>&nbsp;</>
              }
            </button>
            <button className='btn-nav btn-footer' onClick={() => navigate(`/${nextSection}`)}>
              {nextSection.length > 0 &&
                <>{nextButtonText}<br/><i>{nextSection}</i></>
              }
              {nextSection.length === 0 &&
                <>{homeButtonText}<br/>&nbsp;</>
              }
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <button className={'language ' + (props.lang === 'de' ? 'active' : '')} 
              onClick={() => changeLanguage('de', location, props.sections)}>Deutsch</button>
            <button className={'language ' + (props.lang === 'fr' ? 'active' : '')} 
              onClick={() => changeLanguage('fr', location, props.sections)}>Français</button>
            <button className={'language ' + (props.lang === 'it' ? 'active' : '')} 
              onClick={() => changeLanguage('it', location, props.sections)}>Italiano</button>
          </li>
        </ul>
      </nav>
      <div className='footer-bottom'>
        <p className="footer-copyright">© 2022 Pfadibewegung Schweiz</p>
        <ul className='footer-bottom-nav'>
          <li className="child">
            <Link to="/impressum">Impressum</Link>
          </li>
        </ul>
      </div>
    </div>
  </>

}

export default Footer
