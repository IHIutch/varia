import type { DefinedComponent } from '../src/index.js'
import { adapter } from './_engine.js'

export interface Registration {
  components: DefinedComponent[]
  manifest?: false | { path?: string }
  prefix?: string
  breakpoints?: Record<string, string>
}

export interface GenerateOptions {
  prefix?: string
  /** Add a `brand` color, a 50rem `md` breakpoint, and a `custom` utility. */
  custom?: boolean
}

/** One CSS engine behind the shared contract. */
export interface Adapter {
  name: string
  scan: (fixture: string, prefix?: string, authoredCss?: string) => Promise<string>
  packaged: () => Promise<{ css: string, sources: string[] }>
  generate: (components: DefinedComponent[], classes: string[], options?: GenerateOptions) => Promise<string>
  /** Compile user CSS that applies component classes. */
  apply: (components: DefinedComponent[], css: string) => Promise<string>
  /** Resolve a config containing these registrations, as a build or reload would. */
  register: (registrations: Registration[]) => Promise<unknown>
  /** Resolve a config that skips the adapter's required precedence setup. */
  registerWithoutLayers: (components: DefinedComponent[]) => Promise<unknown>
  important: (name: string) => string
  /** How markup, activation selectors, and other selectors spell a prefixed class. */
  prefixed: (prefix: string) => { cls: (name: string) => string, activation: (name: string) => string, other: (name: string) => string }
}

export const adapters = [adapter]
