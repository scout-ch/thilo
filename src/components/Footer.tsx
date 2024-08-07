// import PBSLogo from '../images/pbs_logo.svg';
import { useNavigate, useLocation } from 'react-router-dom'
import type { SectionT } from './Section';
import { Button, ButtonGroup, Truncate } from '@primer/react';
import { ArrowLeftIcon, ArrowRightIcon, IterationsIcon } from '@primer/octicons-react'
import ScrollButton from './ScrollButton';
import { withTranslation } from 'react-i18next';

type Props = {
  t?: any;
}

function handleFooterButtonClick(slug: string) {
  let query = `[data-link=${slug}]`
  if (slug == '') query = '[data-link]';
  (document.querySelector(query) as HTMLElement).click();
}


function Footer({ t }: Props) {
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
  
  var prevSlug = (prevSection && prevSection.slug) || '';
  var nextSlug = (nextSection && nextSection.slug) || '';

  // render the footer with the localized navigation buttons
  return <>
    <ScrollButton className="position-sticky bottom-0 right-0 pb-3 ml-auto"/>
    <footer data-container="footer" className='mb-3'>
      <nav className="footer-nav d-flex flex-justify-between">
        {/* <div className='footer-logo hide-sm mr-6 mb-1 d-inline-flex'><img alt='PBSLogo' src={PBSLogo}></img></div> */}
        {(prevSection || nextSection) && <>
          {/* <ButtonGroup> */}
            <Button 
              className='btn-nav btn-footer px-sm-2 px-md-3 py-5' 
              onClick={() => handleFooterButtonClick(prevSlug)}
              leadingIcon={prevSection? ArrowLeftIcon: IterationsIcon} 
            >
              {prevSection &&
                <>{t('footer.prevButtonText')}<br/>
                  <Truncate title={prevSection?.title} maxWidth={100}><i>{prevSection?.title}</i></Truncate>
                </>
              }
              {!prevSection &&
                <>{t('footer.homeButtonText')}<br/>&nbsp;</>
              }
            </Button>
            <Button 
              className='btn-nav btn-footer px-sm-2 px-md-3 py-5'
              onClick={() => handleFooterButtonClick(nextSlug)}
              trailingIcon={nextSection? ArrowRightIcon: IterationsIcon} 
            >
              {nextSection &&
                <>{t('footer.nextButtonText')}<br/>
                  <Truncate title={nextSection?.title} maxWidth={100}><i>{nextSection?.title}</i></Truncate>
                </>
              }
              {!nextSection &&
                <>{t('footer.homeButtonText')}<br/>&nbsp;</>
              }
            </Button>
          {/* </ButtonGroup> */}
        </>}
        {(!prevSection && !nextSection) && <>
          <Button 
            className='btn-nav btn-footer' 
            onClick={() => handleFooterButtonClick(prevSlug)}
            leadingIcon={IterationsIcon} 
            >
            {t('footer.homeButtonText')}
          </Button>
        </>}
      </nav>


    </footer>
  </>

}

export default withTranslation()(Footer)
