import { useState, useEffect } from 'react'
import cx from 'classnames'
import { MoveToTopIcon } from '@primer/octicons-react'
import { withTranslation } from 'react-i18next'

export type ScrollButtonPropsT = {
  className?: string
  t?: any
}

const ScrollButton = ({ className, t }: ScrollButtonPropsT) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // We cannot determine document.documentElement.scrollTop height because we set the height: 100vh and set overflow to auto to keep the header sticky
    // That means window.scrollTop height is always 0
    // Using IntersectionObserver we can determine if the h1 header is in view or not. If not, we show the scroll to top button, if so, we hide it
    const observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting === false) {
          setShow(true)
        } else {
          setShow(false)
        }
      },
      { threshold: [0] },
    )
    observer.observe(document.getElementsByTagName('h1')[0])
    return () => {
      observer.disconnect()
    }
  }, [])

  const onClick = () => {
    document?.getElementById('root')?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      role="tooltip"
      className={cx(className, 'transition-200', show ? 'opacity-100' : 'opacity-0')}
    >
      <button
        onClick={onClick}
        className={cx(
          'tooltipped tooltipped-n tooltipped-no-delay color-fg-on-emphasis circle border-0',
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