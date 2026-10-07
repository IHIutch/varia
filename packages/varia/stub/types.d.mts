// The project-local generated manifest augments this registry.
// Include node_modules/.varia/manifest.d.ts in your tsconfig.
export interface VariaClassRegistry {}
export type VariaClasses = VariaClassRegistry extends { classes: infer Classes extends string } ? Classes : never
