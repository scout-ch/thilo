import { Helmet } from 'react-helmet-async'
import { withTranslation } from 'react-i18next'

function noMatch(props?: any) {
    const { t } = props

    return <section className='content'>
        <Helmet><title>Thilo - 404 - {t('noMatch.title')} </title></Helmet>
        <div id="section-title" className={`section-title mb-2`}>
            <h1 className={`bg-primary px-2`}>
                404 - {t('noMatch.title')}
            </h1>
        </div>
        <div className='section-body rounded p-3 color-bg-default'>
            <div className='section-description'>
                {t('noMatch.body')}
            </div>
        </div>
    </section>
}

export default withTranslation()(noMatch)
