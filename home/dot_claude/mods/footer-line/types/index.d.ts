export type FooterInfo = {
  model: string
  percent: number
  tokens: number
  window: number
  branch: string | null
}

declare module 'claude-code' {
  interface PluginState {
    'footer-line': { info: FooterInfo | null }
  }
}
