import React from 'react'
import { withTranslation } from 'react-i18next'
import { Role } from './Chapter'

type Props = {
  t: any
  targets: Array<Role>
}

// render the target list of a chapter, i.e. the 'responsible' roles or perhaps 'contact' roles, 'useful-for' etc.
// currently not used
function Target(props: Props) {
 const { t, targets } = props

  const targetList = targets.map(function (target: Role) {
    return <>
      <div key={target.rolle} className='role'>{t(`target.role.${target.rolle}`)}</div>
    </>
  })

  return <div className='targets'>
    {targetList}
  </div>
}

export default withTranslation()(Target)