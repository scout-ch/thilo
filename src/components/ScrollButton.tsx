import { useState, useEffect } from 'react'
import cx from 'classnames'
import { MoveToTopIcon } from '@primer/octicons-react'
import { withTranslation } from 'react-i18next'
import { use } from 'i18next'

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
    document?.getElementsByTagName('h1')[0].scrollIntoView( { behavior: 'smooth' } );
    setShow(false)
  }

  return (
    <div
      role="tooltip"
      className={cx(className, 'no-print', '', 'transition-200', show ? 'opacity-100' : 'opacity-0 d-none')}
      style={{width: "fit-content"}}
    >
      <button
        onClick={onClick}
        className={cx(
          'tooltipped tooltipped-nw tooltipped-no-delay color-fg-on-emphasis circle border-0',
          'd-flex flex-items-center flex-justify-center',
          'bg-primary',
        )}
        style={{ width: 40, height: 40 }}
        aria-label={t("scrollButton.tooltip")}
      >
        <MoveToTopIcon />
      </button>
    </div>
  )
}

export default withTranslation()(ScrollButton)