import PBSLogo from '../images/pbs_logo.svg';
import i18n from './../i18n';
import { useNavigate, useLocation } from 'react-router-dom'
import type { SectionT } from './Section';
import { Button, ButtonGroup, Truncate } from '@primer/react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from '@primer/octicons-react'
import ScrollButton from './ScrollButton';

type Props = {
  t?: any;
}

function Footer({ t }: Props) {
  // to change the language, we need to set the language in the url and reload the page
  const navigate = useNavigate();
  const locale = i18n.language;
  const sections = window.sections;

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
        <Button size="large" className='btn-nav btn-footer'
          onClick={() => navigate(`/${prevSlug}`)}
          leadingIcon={ArrowUpIcon} 
        >
          {homeButtonText}
        </Button>
        </>
        }
        <ScrollButton className="position-fixed bottom-0 mb-4 right-0 mr-5 z-1"/>
      </nav>
    </div>
  </>

}

export default Footer
