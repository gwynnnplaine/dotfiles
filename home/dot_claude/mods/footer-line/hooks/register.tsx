import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { FooterInfo } from '../types'

const info = atom({ plugin: 'footer-line', key: 'info' } as const, null)

const BAR_WIDTH = 10

const kilo = (n: number) => `${Math.round(n / 1000)}k`

const bar = (percent: number) => {
  const filled = Math.min(BAR_WIDTH, Math.floor((percent * BAR_WIDTH) / 100))
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
}

// claude-opus-5-5[1m] -> Opus 5.5
const displayName = (model: string) => {
  const match = /^claude-([a-z]+)-(\d+)(?:-(\d+))?/.exec(model)
  if (!match?.[1]) {
    return model
  }
  const family = match[1][0]!.toUpperCase() + match[1].slice(1)
  return `${family} ${match[2]}${match[3] ? `.${match[3]}` : ''}`
}

const refresh = async ($: EngineInterface) => {
  const [model, usage, git] = await Promise.all([
    $.session.model(),
    $.session.usage(),
    $.process.run(['git', 'branch', '--show-current']).catch(() => null),
  ])
  const branch = git?.exitCode === 0 ? git.stdout.trim() || null : null
  const next: FooterInfo = {
    model: displayName(model),
    percent: usage.context.percent ?? 0,
    tokens: usage.context.tokens ?? 0,
    window: usage.context.window,
    branch,
  }
  await update($, info, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  on('session.measure', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const current = await read($, info)
    if (current === null) {
      return next(e)
    }

    const { model, percent, tokens, window } = current
    const tail = ` [${model}] ${bar(percent)} ${percent}% (${kilo(tokens)}/${kilo(window)})`
    return next({ ...e, props: { ...e.props, tail } })
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const current = await read($, info)
    if (!current?.branch) {
      return next(e)
    }

    return next({ ...e, props: { ...e.props, modes: [...e.props.modes, current.branch] } })
  })
}
