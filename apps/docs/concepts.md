# Concepts

Varia separates style authoring from the markup that uses those styles. A definition names a component's base utilities, variants, and optional slots or compounds. `tailwindVaria` registers that definition with Tailwind. Your templates select styles through ordinary CSS classes.

## Registration and generation are different

Registering a definition makes its classes available to Tailwind. Tailwind generates their CSS when it discovers the activation names in configured sources. Registration alone does not emit a full component stylesheet.

For example, a `demo-btn` definition with `size.lg` makes `demo-btn` and `demo-btn-size-lg` available. A template containing both names causes Tailwind to generate their expansions. A configured but unused component contributes no component CSS.

This keeps output tied to source usage, but means a runtime expression cannot invent classes that the build has never seen. Selecting from a map of complete literal names gives Tailwind something to discover. [Integration instructions](/tailwind) show that pattern.

## Classes describe CSS rules

Varia does not run a variant resolver in the application. Applying a variant class activates CSS; it does not merge the class attribute, select a default value, or remove conflicting values. The browser resolves competing declarations through CSS.

Slots extend this model across elements. A slot class such as `panel__title` has its own base expansion. A slot variant on an ancestor generates a descendant selector such as `.panel-accent .panel__title`. Because this is a descendant selector, an outer component can affect a nested instance with the same slot name. Component boundaries in a framework do not stop CSS descendant matching.

Compounds generate combined selectors on the activation element. They have no additional class of their own. The first condition activates generation; the remaining conditions require their exact bare class names. This is why independently responsive condition classes do not combine into an inferred effective state. See [activation and slots](/reference/definitions#slot-activation) and [compound semantics](/naming#responsive-compound-conditions).

## Layers make utility overrides possible

The layer stylesheet orders normal component declarations as base or slot styles, variants, then compounds. Tailwind atomic utilities outrank these component sublayers. This lets markup use a utility such as `px-8` to override a component's padding without changing its definition.

This precedence comes from cascade layers, not the order of words in a class attribute. Reordering classes does not resolve competing values of one variant axis. Important declarations reverse layer priority, so the normal precedence rule does not describe `!important` conflicts. [Override instructions](/guides/override-styles) and [the cascade reference](/tailwind#slots-and-compounds) cover those cases.

## Application responsibilities

Varia produces styles. Your application supplies elements, event handling, focus management, semantics, and accessible interaction. The repository recipes are adaptable definitions. A modal style recipe does not implement an accessible dialog, and a dropdown style recipe does not implement keyboard navigation.

Return to [the documentation index](/documentation) for task guides or consult [the definition reference](/reference/definitions) for exact rules.
