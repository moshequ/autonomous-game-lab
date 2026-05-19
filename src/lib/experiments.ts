import { trackEvent } from './analytics'
import { experimentPolicy } from '../data/experimentPolicy'

export const experiments = experimentPolicy.experiments

export type ExperimentKey = keyof typeof experiments
export type ExperimentVariant = (typeof experiments)[ExperimentKey]['variants'][number]

const assignmentKey = (key: ExperimentKey) => `agl.experiment.${key}`

const chooseVariant = (variants: readonly ExperimentVariant[]) => {
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0)
  const roll = Math.random() * total
  let cursor = 0

  return (
    variants.find((variant) => {
      cursor += variant.weight
      return roll <= cursor
    }) ?? variants[0]
  )
}

export const getExperimentVariant = (key: ExperimentKey) => {
  const saved = window.localStorage.getItem(assignmentKey(key))
  const variants = experiments[key].variants
  const existing = variants.find((variant) => variant.id === saved)

  if (existing) {
    return existing
  }

  const assigned = chooseVariant(variants)
  window.localStorage.setItem(assignmentKey(key), assigned.id)
  trackEvent('experiment_assigned', {
    experiment: key,
    variant: assigned.id,
  })
  return assigned
}
