import PBSLogo from '../images/pbs_logo.svg';
import i18n from './../i18n';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { SectionT } from './Section';
import { Button, ButtonGroup, Truncate } from '@primer/react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from '@primer/octicons-react'

function Footer() {
  // to change the language, we need to set the language in the url and reload the page
  const navigate = useNavigate();
  const locale = i18n.language;
  const sections = window.sections;

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
  // console.log(currentSectionSlug, currentChapter, sections)
  var prevSection: SectionT | null = null, nextSection: SectionT | null = null;
  if(currentSectionSlug) {
    for(let i = 0; i < sections.length; i++) {
      if(sections[i].slug === currentSectionSlug) {
        if(i>0) {
          prevSection = sections[i-1];
        }
        if(i<sections.length-1) {
          nextSection = sections[i+1];
        }
      }
    }
  } else if(sections[0]) { 
    // if no sections[0] then we can't access the section titles
    nextSection = sections[0];
    prevSection = sections[sections.length-1];
  }
  
  // localize the navigation buttons
  let prevButtonText = "Previous Chapter";
  let nextButtonText = "Next Chapter";
  let homeButtonText = "Return to Start";
  if (locale === 'de') {
    prevButtonText = "Vorheriges Kapitel";
    nextButtonText = "Nächstes Kapitel";
    homeButtonText = "Zurück zum Start";
  } else if (locale === 'fr') {
    prevButtonText = "Chapitre Précédent";
    nextButtonText = "Chapitre Suivant";
    homeButtonText = "Retour au Début";
  } else if (locale === 'it') {
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
        <div className='footer-logo'><img alt='PBSLogo' src={PBSLogo}></img></div>
        {(prevSection || nextSection) && <>
        <ButtonGroup className='width-full'>
          <Button size="large" className='btn-nav btn-footer pb-5 pt-5' 
            onClick={() => navigate(`/${prevSlug}`)}
            leadingIcon={prevSection? ArrowLeftIcon: ArrowUpIcon} 
          >
            {prevSection &&
              <>{prevButtonText}<br/>
                <Truncate title={prevSection?.title} maxWidth={100}><i>{prevSection?.title}</i></Truncate>
              </>
            }
            {!prevSection &&
              <>{homeButtonText}<br/>&nbsp;</>
            }
          </Button>
          <Button size="large" className='btn-nav btn-footer pb-5 pt-5'
            onClick={() => navigate(`/${nextSlug}`)}
            trailingIcon={nextSection? ArrowRightIcon: ArrowUpIcon} 
          >
            {nextSection &&
              <>{nextButtonText}<br/>
                <Truncate title={nextSection?.title} maxWidth={100}><i>{nextSection?.title}</i></Truncate>
              </>
            }
            {!nextSection &&
              <>{homeButtonText}<br/>&nbsp;</>
            }
          </Button>
        </ButtonGroup>
        </>
        }
        {(!prevSection && !nextSection) && <>
        <Button className='btn-nav btn-footer pb-5 pt-5'
          onClick={() => navigate(`/${prevSlug}`)}
          leadingIcon={ArrowUpIcon} 
        >
          {homeButtonText}<br/>&nbsp;
        </Button>
        </>
        }
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
