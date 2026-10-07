# Changelog

## 1.0.0 (unreleased)

First stable release of the Tailwind implementation.

- Define base styles, slots, boolean and multi-value variants, and compound conditions with `defineComponent`.
- Register on-demand component CSS with `tailwindVaria` and Tailwind 4's native utility expansion.
- Establish normal cascade precedence with `variacss/tailwind.css`, with native utilities overriding component layers.
- Support responsive classes and prefixes within the documented compound and nested-slot boundaries.
- Use native Tailwind CSS IntelliSense with ordinary class strings.
- Let Tailwind validate utility syntax in active expansions.
- Use native Vite configuration reload for statically imported recipes and shared sources.
- Provide installation, troubleshooting, compatibility, and archive-based release instructions.

The pre-release `varia/adapter` alias, `variacss/types` export, and `manifest` option are removed. Migrate to `variacss/tailwind` and native Tailwind editor suggestions. Generated definition structures are private implementation details. See [API.md](API.md) for the v1 contract and supported toolchain.
