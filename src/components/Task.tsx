import React from 'react'
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'
import type { ChapterT, Role } from './Chapter';

export type TaskT = {
  deadline: Date
  title: string
  targets: Array<Role>
  responsible: Array<Role>
  chapters: Array<ChapterT>
  t: any
}

function Task(props: TaskT) {
  // currently not used and not integrated, see https://scout-ch.github.io for examples
  var options = { year: 'numeric', month: 'numeric', day: 'numeric' }

  // @ts-ignore
  const deadline = props.deadline.toLocaleDateString('de-DE', options)
  const targets = props.targets.map((target) => target['rolle']).join(', ')
  const responsible = props.responsible.map((responsible) => props.t(`target.role.${responsible['rolle']}`)).join(', ')
  const chapters = props.chapters.map(function(chapter) {
    return <li key={chapter.slug}><Link to={chapter.slug_with_section}>{chapter.title}</Link></li>
  })
  return <tr>
    <td>{deadline}</td>
    <td>{props.title}</td>
    <td>{responsible}</td>
    <td>{targets}</td>
    <td><ul>{chapters}</ul></td>
  </tr>
}

export default withTranslation()(Task)
