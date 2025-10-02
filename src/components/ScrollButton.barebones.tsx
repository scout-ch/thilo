import { useState, useEffect } from 'react'
import { MoveToTopIcon } from './icons.barebones'
import { withTranslation } from 'react-i18next'

export type ScrollButtonPropsT = {
  className?: string
  t?: any
}

const ScrollButton = ({ className, t }: ScrollButtonPropsT) => {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) {
        setShow(true)
      } else {
        setShow(false)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  })

  const onClick = () => {
    const h1 = document?.getElementsByTagName('h1')[0]
    if (h1) {
      h1.scrollIntoView({ behavior: 'smooth' })
    }
    setShow(false)
  }

  return (
    <div
      role="tooltip"
      className={`scroll-button-wrapper ${className || ''} ${show ? 'scroll-button-visible' : 'scroll-button-hidden'}`}
    >
      <button
        onClick={onClick}
        className="scroll-button"
        aria-label={t("scrollButton.tooltip")}
      >
        <MoveToTopIcon />
      </button>
    </div>
  )
}

export default withTranslation()(ScrollButton)
