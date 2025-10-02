import { useNavigate, useLocation } from 'react-router-dom'
import type { SectionT } from './Section'
import Button from './Button.barebones'
import Truncate from './Truncate.barebones'
import { ArrowLeftIcon, ArrowRightIcon, IterationsIcon } from './icons.barebones'
import ScrollButton from './ScrollButton.barebones'
import { withTranslation } from 'react-i18next'

type Props = {
  t?: any
}

function handleFooterButtonClick(slug: string) {
  let query = `[data-link=${slug}]`
  if (slug === '') query = '[data-link]'
  const element = document.querySelector(query) as HTMLElement
  if (element) element.click()
}

function Footer({ t }: Props) {
  const sections = window.sections
  const location = useLocation()
  
  // get the proper texts for the navigation buttons based on relative section position
  var currentSectionSlug = location.pathname.replace('/', '')
  var prevSection: SectionT | null = null, nextSection: SectionT | null = null
  
  if(currentSectionSlug) {
    for(let i = 0; i < sections.length; i++) {
      if(sections[i].slug === currentSectionSlug) {
        if(i>0) {
          prevSection = sections[i-1]
        }
        if(i<sections.length-1) {
          nextSection = sections[i+1]
        }
      }
    }
  } else if(sections[0]) { 
    // if no sections[0] then we can't access the section titles
    nextSection = sections[0]
    prevSection = sections[sections.length-1]
  }
  
  var prevSlug = (prevSection && prevSection.slug) || ''
  var nextSlug = (nextSection && nextSection.slug) || ''

  // render the footer with the localized navigation buttons
  return (
    <>
      <ScrollButton className="scroll-button-container" />
      <footer data-container="footer" className='footer-container'>
        <nav className="footer-nav">
          {(prevSection || nextSection) && (
            <>
              <Button 
                className='btn-nav btn-footer' 
                onClick={() => handleFooterButtonClick(prevSlug)}
                leadingIcon={prevSection ? ArrowLeftIcon : IterationsIcon} 
              >
                <span>
                  {prevSection ? t('footer.prevButtonText') : t('footer.homeButtonText')}
                </span>
                {prevSection && (
                  <Truncate title={prevSection?.title} maxWidth={100}>
                    <i>{prevSection?.title}</i>
                  </Truncate>
                )}
              </Button>
              <Button 
                className='btn-nav btn-footer'
                onClick={() => handleFooterButtonClick(nextSlug)}
                trailingIcon={nextSection ? ArrowRightIcon : IterationsIcon} 
              >
                <span>
                  {nextSection ? t('footer.nextButtonText') : t('footer.homeButtonText')}
                </span>
                {nextSection && (
                  <Truncate title={nextSection?.title} maxWidth={100}>
                    <i>{nextSection?.title}</i>
                  </Truncate>
                )}
              </Button>
            </>
          )}
          {(!prevSection && !nextSection) && (
            <Button 
              className='btn-nav btn-footer' 
              onClick={() => handleFooterButtonClick(prevSlug)}
              leadingIcon={IterationsIcon} 
            >
              {t('footer.homeButtonText')}
            </Button>
          )}
        </nav>
      </footer>
    </>
  )
}

export default withTranslation()(Footer)
