# Style recipes

These recipes provide adaptable style definitions, markup, and live previews. Your application supplies behavior, semantics, focus management, and accessibility.

First [integrate Varia with Tailwind](/tailwind). Copy the chosen definition into your project, import `defineComponent` from `variacss`, and add the factory output to your registration module's `components` array. Keep complete class names in scanned templates. Import the registration module from Vite configuration for automatic definition reload.

| Goal | Examples |
| --- | --- |
| Style actions | [Button](/recipes/button), [icon button](/recipes/icon-button) |
| Style content | [Card](/recipes/card), [avatar](/recipes/avatar) |
| Style controls and status | [Form input](/recipes/form-input), [spinner](/recipes/spinner) |
| Arrange responsive columns | [Row and column grid](/recipes/grid) |
| Style interactive containers | [Dropdown](/recipes/dropdown), [modal](/recipes/modal) |

Interactive container styles do not implement dialog focus handling, keyboard navigation, or application behavior. Each recipe explains the markup and styling you can adapt. Choose component names that avoid your other registrations and native Tailwind utilities.
