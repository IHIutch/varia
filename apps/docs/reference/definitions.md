# Definitions

Use this page to look up authoring shapes, slot matching, and public imports. For a complete task, follow [the slot guide](/guides/style-child-elements); for a learning sequence, follow [the tutorial](/quickstart).

## Authoring definitions

`ClassInput` accepts a nonempty utility string or an array of strings joined with spaces. Varia delegates expansion to Tailwind's native `@apply`. Theme variables, custom utilities, arbitrary values/selectors, and individual modifiers such as `hover:` and `md:` retain Tailwind behavior. Tailwind rejects variant groups such as `hover:(bg-blue-600 text-white)` when compiling an active expansion. Varia does not parse utility syntax; unused utilities are not resolved. Write `hover:bg-blue-600 hover:text-white`. Literal punctuation inside arbitrary-value brackets is allowed.

At least one base/slot or variant is required. `base` is shorthand for `slots: { root: base }`; setting both is an error. Explicit `slots: {}` is an error. Variants without a base, and slots without a `root`, are supported. Those definitions do not register a bare component class unless a root/base is declared. Empty expansions, empty maps for a variant axis, and empty slot maps within values are errors.

Variant definitions have these supported shapes:

- A string or array is a boolean variant applied to the activation element.
- An object whose keys all name declared slots is a boolean slot variant.
- An object whose keys all differ from declared slots is a multi-value variant. Each value may be a string, array, or slot-keyed object.
- A multi-value slot map may target any nonempty subset of declared slots.

An object mixing slot names with value names is ambiguous and rejected. Slot names are reserved as top-level value names within variant definitions. With a declared `root`, `variants: { tone: { root: 'ring-2' } }` is boolean `card-tone`, not multi-value `card-tone-root`. Use a different value name such as `default` for a multi-value axis. Unknown slots inside a multi-value slot map are errors.

Boolean activation has no generated false class and no default value. Omitting its class leaves it inactive. Varia does not select or merge values for an axis. Applying multiple values leaves the conflict to CSS; class attribute order does not select a winner.

## Slot activation

Tailwind must discover literal class names in its configured sources, or receive them through its native source configuration. Dynamic construction such as `'card-size-' + size` is outside source scanning support. Registering definitions does not eagerly emit CSS.

Each scanned base, slot, or flat variant class emits its own expansion. A slot-keyed variant emits all of its slot rules when its activation class is scanned, even if the base and descendant slot classes were not scanned. It does not automatically include their base expansions.

Root styles match the activation element without requiring the bare component class. Other slot styles use descendant selectors such as `.card-accent .card__title`. Slots need not be direct children, but must be descendants. A `card__title` on the activation element itself does not match.

There is no nearest-component ownership or nested-instance isolation. An outer `card-accent` styles every matching `card__title` below it, including titles inside a nested `card`. Different component names have different slot classes. Use distinct definition names or explicit application CSS when nested instances must be independent. A nested root does not stop the outer selector.

Slot matching requires the literal bare slot class, or its configured prefix form. A descendant with only `md:card__title` does not match `.card__title`; include `card__title` when slot variants should target it. Responsive slot base classes remain available independently.

States inside a slot expansion act on the styled slot. A usage-site modifier acts on the activation element. Thus `hover:card-accent` with a title expansion `focus:opacity-75` requires hover on the activation element and focus on the title for that declaration.

## Supported imports

| Import | Supported interface |
| --- | --- |
| `variacss` | `defineComponent` and the authoring types listed below |
| `variacss/tailwind` | `tailwindVaria` and `TailwindVariaOptions` |
| `variacss/tailwind.css` | Stylesheet establishing cascade order |

The root authoring types are `ClassInput`, `ComponentConfig`, `CompoundVariantRule`, `CompoundVariantWhen`, `DefinedComponent`, `SlotKeyedValue`, `VariantDefinition`, and `VariantValue`. `DefinedComponent` is factory output for registration. Pass it unchanged to `tailwindVaria`; do not construct, mutate, serialize, or extend its generated structure. Its `shortcuts`, `styles`, and `classNames` members are implementation details. Their layout and generated CSS formatting can change without a major release. The type requires factory output; `Shortcut` and `ComponentStyle` are private types.
