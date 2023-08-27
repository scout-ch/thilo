import React from 'react'
import PBSLogo from '../static/images/pbs_logo.svg';
import i18n from './../i18n';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { SectionT } from './Section';

type Props = {
  lang: string
  sections: SectionT[]
}

function Footer(props: Props) {
  // to change the language, we need to set the language in the url and reload the page
  const navigate = useNavigate();
  const changeLanguage = (lang: string, location: any, oldSections: SectionT[]) => {
    let redirect = false
    const path = location.pathname.replace('/', '')
    const currentSection = oldSections.find((s) => { return s['slug'] === path })
    i18n.changeLanguage(lang).then((_t) => {
      // we need to reload if we are on the impressum page
      if (path === 'impressum') {
        redirect = true
        return
      }
      // else we need to get the new sections and check if the current section has a translation
      let sectionsLocal = window.localStorage.getItem(`sections_${lang}`);
      let newSections: SectionT[] = [];
      if(sectionsLocal !== null) {
        newSections = JSON.parse(sectionsLocal)
      } else {
        console.error('No sections found in local storage')
        return
      }
      if (currentSection) {
        // TODO: Explore method using localizations by i18n instead of new requests
        // const localizedSection = currentSection['localizations'].find((l: any) => { return l.locale === lang })
        const localizedSection = newSections.find((s: any) => { return s['sorting'] === currentSection['sorting'] })

        // if the current section has the requested localization, we need to redirect to the new section
        if(newSections && localizedSection) {
          const newCurrentSection = newSections.find((s: any) => { return s['sorting'] === localizedSection['sorting'] })
          if (newCurrentSection) {
            redirect = true
            navigate('/' + newCurrentSection.slug)
          }
        }
      }
      // if no localized section is found, we need to redirect to the start page
      if (!redirect) {
        navigate('/')
      }
    });
  }

  const location = useLocation();
  // get the proper texts for the navigation buttons based on relative section position
  var currentSectionSlug = location.pathname.replace('/', '');
  // console.log(currentSectionSlug, currentChapter, props.sections)
  var prevSection: SectionT | null = null, nextSection: SectionT | null = null;
  if(currentSectionSlug) {
    for(let i = 0; i < props.sections.length; i++) {
      if(props.sections[i].slug === currentSectionSlug) {
        if(i>0) {
          prevSection = props.sections[i-1];
        }
        if(i<props.sections.length-1) {
          nextSection = props.sections[i+1];
        }
      }
    }
  } else if(props.sections[0]) { 
    // if no props.sections[0] then we can't access the section titles
    nextSection = props.sections[0];
    prevSection = props.sections[props.sections.length-1];
  }
  
  // localize the navigation buttons
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

  var prevSlug = prevSection && prevSection.slug;
  var nextSlug = nextSection && nextSection.slug;
  if (!prevSection) prevSlug = '';
  if (!nextSection) nextSlug = '';

  // render the footer with the localized navigation buttons
  return <>
    <div className="footer-content">
      <nav className="footer-nav">
        <div className='footer-logo'><img src={PBSLogo}></img></div>
        <div>
          <button className='btn-nav btn-footer' onClick={() => navigate(`/${prevSlug}`)}>
            {prevSection &&
              <>{prevButtonText}<br/><i>{prevSection?.title}</i></>
            }
            {!prevSection &&
              <>{homeButtonText}<br/>&nbsp;</>
            }
          </button>
          <button className='btn-nav btn-footer' onClick={() => navigate(`/${nextSlug}`)}>
            {nextSection &&
              <>{nextButtonText}<br/><i>{nextSection?.title}</i></>
            }
            {!nextSection &&
              <>{homeButtonText}<br/>&nbsp;</>
            }
          </button>
        </div>
        <div className='language'>
          <button className={'btn-language' + (props.lang === 'de' ? ' active' : '')} 
            onClick={() => changeLanguage('de', location, props.sections)}>Deutsch</button>
          <button className={'btn-language' + (props.lang === 'fr' ? ' active' : '')} 
            onClick={() => changeLanguage('fr', location, props.sections)}>Français</button>
          <button className={'btn-language' + (props.lang === 'it' ? ' active' : '')} 
            onClick={() => changeLanguage('it', location, props.sections)}>Italiano</button>
        </div>
      </nav>
      <div className='footer-bottom'>
        <div className='footer-bottom-nav'>
          <div className="footer-copyright">© 2022 Pfadibewegung Schweiz</div>
          <Link to="/impressum">Impressum</Link>
        </div>
      </div>
    </div>
  </>

}

export default Footer
