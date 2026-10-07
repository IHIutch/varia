# Documentation onboarding and information architecture

Reviewed 2026-10-07. Sources are current official Bootstrap 5.3, Astro, and Diátaxis documentation. The review covers documentation entry points, installation, a tutorial, representative reference pages, and recipes. Desktop layout observations come from the shared browser inspection. This is a content and navigation review, not a mobile, accessibility, search-quality, or usability test.

## Recommendation

Use Diátaxis to decide each page's purpose, then use Bootstrap and Astro as examples of presentation and navigation. Separate learning a skill, completing a task, looking up exact behavior, and understanding the design. The earlier recommendation omitted explanation and used topic names where task titles would be clearer. [Diátaxis](https://diataxis.fr/)

For Varia, start with a short tutorial that produces a component style definition registered with Tailwind, loaded through CSS, and used in markup. Give existing Tailwind users a separate integration how-to. Preserve recipes as adaptable examples, add conceptual explanation, and keep repository development in a contributor path.

These are recommendations inferred from the observed documentation patterns and Varia's current contract. The review does not establish that either documentation system produces better onboarding completion rates.

## Observed Bootstrap patterns

### First result before deeper setup

The introduction starts with a numbered CDN quick start, complete HTML, and a browser verification step. It then offers next steps, package-manager setup, JavaScript requirements, and global settings. The sidebar groups material by product topic, including Getting started, Customize, Layout, Forms, Components, and Utilities. On desktop, the introduction has global navigation, search and a version selector, a left topic sidebar, a central article, and right-hand page anchors. [Bootstrap introduction](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

Interpretation: readers can reach a visible result without choosing a bundler first. Product navigation also gives experienced readers direct access to named features. Varia needs a build integration, so its equivalent must include that integration rather than imitate the CDN path.

### Installation paths are self-contained

The Vite guide provides dependency installation, a project tree, named files, configuration, imports, a run command, and a styled example to confirm that CSS loaded. It links to deeper Sass and JavaScript material when narrower imports become relevant. [Bootstrap and Vite](https://getbootstrap.com/docs/5.3/getting-started/vite/)

Interpretation: a setup page should be executable in reading order. A sentence that says to register styles is insufficient if the reader must locate configuration and CSS-loader details elsewhere.

### Examples lead into detailed reference

The Buttons page progresses through the base class, variants, sizes, disabled states, layout examples, plugin behavior and methods, then CSS variables and Sass configuration. Rendered controls sit beside their HTML examples. Accessibility and behavior caveats appear beside the affected usage. [Bootstrap buttons](https://getbootstrap.com/docs/5.3/components/buttons/)

Interpretation: readers can start by recognizing the result they want and continue into customization or exact behavior on the same page. For Varia, this pattern belongs in recipe pages, with definition code as well as markup. The page must identify which behavior the application supplies.

The Customize overview separately routes readers to Sass, options, colors, component construction, CSS variables, and optimization. It distinguishes customization through source files from overriding compiled distribution styles. [Bootstrap customization](https://getbootstrap.com/docs/5.3/customize/overview/)

Interpretation: overview pages can explain a choice before exposing its details. Varia's comparable choices concern authoring styles, configuring generation, and using generated classes. Bootstrap's full component catalog should not determine Varia's core taxonomy.

## Observed Astro patterns

### Entry points match reader intent

The docs landing page offers installation and an explanation of Astro's features, then routes readers toward a guided blog tutorial, a new-project command, and starter themes. The desktop sidebar switches between Tutorial, Guide, Reference, and Ecosystem. Guide navigation groups tasks such as starting a project, configuration, routing, building UI, adding content, and upgrading. Search appears above the navigation. [Astro docs entry](https://docs.astro.build/en/getting-started/)

Interpretation: a beginner, a returning task-focused user, and someone checking an API can take different paths. Varia can use these distinctions with fewer categories and fewer pages. It does not yet need an Ecosystem category simply because Astro has one.

### Installation has a recommended path and alternatives

The installation page puts prerequisites before the CLI wizard steps. It provides package-manager command choices, an online preview option, template and integration flags, and a later manual setup section. The main path ends by directing readers to a running development preview. [Install Astro](https://docs.astro.build/en/install-and-setup/)

Interpretation: offer a default installation path, then explain alternatives where readers need them. Varia should state supported configuration bounds and package availability before giving consumer commands. A workspace demo command should be labeled as repository development.

### Tutorial and recipes have different jobs

The blog tutorial follows one project through setup, pages, components, layouts, APIs, and islands. It includes unit check-ins, task lists, completion tracking, and exercises. Deployment occurs in the initial setup unit. [Astro blog tutorial](https://docs.astro.build/en/tutorial/0-introduction/)

Interpretation: the tutorial teaches by extending one result. A Varia tutorial can extend one component style through variants, slots, and compounds. Its first checkpoint should prove CSS generation before adding those concepts. A large course or progress tracker would require more content and maintenance than a short initial walkthrough.

Astro describes recipes as focused guides that complete a working example of a specific task. Its index lists concrete tasks with short descriptions and separates official recipes from community resources. [Astro recipes](https://docs.astro.build/en/recipes/)

Interpretation: Varia can distinguish its learning sequence from independent recipes that readers copy and adapt. Recipe indexes should explain the style technique each example teaches, not only show a component name.

### Reference supports precise lookup

The configuration reference groups options and gives entries addressable headings. Entries document types, defaults where relevant, version additions, examples, and links to guides. Deprecated options state the replacement. [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/)

Interpretation: Varia's public contract should remain the authority for exact semantics. Guides should link to specific contract sections instead of reproducing every validation rule and compatibility detail.

## Reconsidering the review through Diátaxis

Diátaxis distinguishes documentation by the reader's need, not by whether a page contains code or numbered steps. Its compass asks whether the content supports action or knowledge, and whether the reader is acquiring or applying a skill. [The compass](https://diataxis.fr/compass/)

| Form | Reader need | Varia application proposed here |
| --- | --- | --- |
| Tutorial | Acquire skills through a guided practical experience | Build a first component style in a chosen setup |
| How-to guide | Apply skills to a specific task or problem | Add Varia to an existing Tailwind project |
| Reference | Consult exact descriptions of the product | Look up definition shapes and activation rules |
| Explanation | Understand context, connections, and design choices | Understand the relationship between definitions, scanned classes, and emitted CSS |

These distinctions come from the official [tutorial](https://diataxis.fr/tutorials/), [how-to](https://diataxis.fr/how-to-guides/), [reference](https://diataxis.fr/reference/), and [explanation](https://diataxis.fr/explanation/) guidance. The Varia examples are this review's interpretation.

A "quick start" needs a declared purpose. A first learning experience needs one chosen setup, small actions, expected results, and few alternatives. A task guide for an existing project can assume relevant skills and accommodate integration choices. Shortness alone does not make either page a tutorial. Bootstrap's complete setup remains useful, but its mixture of introduction, alternatives, and reference should not become Varia's tutorial format. Astro's guided project is a closer model for the learning path. [Tutorials](https://diataxis.fr/tutorials/), [How-to guides](https://diataxis.fr/how-to-guides/)

Recipes are not a fifth Diátaxis form. A recipe that guides a reader toward a specific result belongs with how-to guides. A gallery entry that presents definition code and markup can remain an example collection. Each entry should state its purpose. Likewise, "Variants" and "Slots" are topics, not sufficient task titles. The same topic may need a how-to, precise reference, and explanation linked together. [How-to guides](https://diataxis.fr/how-to-guides/), [Reference](https://diataxis.fr/reference/)

Diátaxis does not require four top-level navigation tabs or an immediate documentation rebuild. Its workflow favors improving small pieces and allowing structure to follow useful content. The sitemap below is a way to check coverage, not a backlog of empty sections to create. [Diátaxis workflow](https://diataxis.fr/how-to-use-diataxis/)

## What this means for Varia

Local evidence comes from [README.md](../../README.md) and [the definition reference](../../apps/docs/reference/definitions.md). The README explains the product and shows a definition plus markup. Registration is a paragraph rather than a complete setup. The next substantial instructions install workspace dependencies and run contributor checks. The API contract supplies registration, CSS imports, activation rules, slots, compounds, cascade behavior, generated types, and compatibility bounds.

The missing path is consumer onboarding. Readers see the intended class syntax but cannot complete the whole installation-to-styled-element sequence in the README. The contract also combines introductory examples with details such as first-condition compound activation and descendant slot matching.

Prioritize these changes:

1. Create a short "Your first component style" tutorial with one supported setup, exact files, commands, definition registration, CSS imports, literal markup classes, and visible checkpoints. Verify package distribution before promising a registry installation command. If distribution requires local consumption, choose that route and label it clearly.
2. Add "Integrate Varia into an existing Tailwind project" as a separate how-to with prerequisites and integration choices. Keep the tutorial on one path and link to this guide for readers who already have a project.
3. Move workspace setup and contributor checks into contributor documentation. Keep a short link in the README. Preserve the README's product explanation and small definition-to-markup example.
4. Extend the tutorial only after the first CSS checkpoint. Add one multi-value variant, then slots and compounds in later lessons as needed. Show literal class names early; move the rationale for source scanning to explanation and the complete grammar to reference. Introduce optional generated types after styling works.
5. Write task guides with outcome-based titles, such as "Style a component's child elements" and "Change variants at a breakpoint." Put constraints needed to complete the task beside the affected step. Link to the exact reference for descendant slot matching, nested-instance leakage, first-condition compound activation, and generated type limits.
6. Add a concise explanation of the styling model. Connect definitions, registration, source scanning, CSS generation, and optional type generation. Explain why registration and type generation do not eagerly emit component CSS. Keep exact semantics in the public contract and link both ways.
7. Keep recipes labeled as adaptable component styles. Each example needs a result, definition, markup, prerequisite link, adaptation notes, and any behavior or accessibility the application must implement. Classify procedural recipes as how-to guides.

## Possible content map

This maps reader needs to potential content. It is not a requirement to create all these pages or use these exact navigation labels. Multiple topics can remain anchored sections while the documentation is small.

```text
Docs home
  Get started
    Your first component style [tutorial]
    Extend the style with variants and slots [later tutorial]
  How-to guides
    Integrate Varia into an existing Tailwind project
    Style a component's child elements
    Change variants at a breakpoint
    Combine variant conditions
    Override a component style
    Generate TypeScript class types
    Fix missing generated styles
    Reproduce and adapt a button or card style [procedural recipes]
  Explanation / Concepts
    What is Varia?
    How definitions, source scanning, and CSS generation fit together
    The relationship between variants, slots, and compounds
    Cascade and nested component tradeoffs
  Reference
    defineComponent and definition shapes
    tailwindVaria options and CSS entry
    Class naming and activation rules
    Generated class types
    Compatibility and public contract
  Examples
    Button, card, grid, and other style examples [collection]
  Contribute
    Repository setup and checks [contributor how-to]
    Architecture and historical comparisons [contributor explanation]
```

"Get started" can route readers to both the tutorial and the integration how-to. "Concepts" is a reader-facing label for explanation. Examples are a collection, and Contribute is an audience route; neither introduces another Diátaxis form.

On a future docs site, use a left topic sidebar with an active page and an article table of contents for longer pages. Add explicit next steps to the tutorial. Search and version navigation should follow actual content volume and supported versions. The current Markdown documentation can provide these paths through a docs index, stable headings, and links without a site rebuild.

## Page requirements and completion checks

| Content purpose | Required content | Reader checkpoint |
| --- | --- | --- |
| Tutorial | One chosen setup, exact files and actions, expected results, small steps, optional links for deeper explanation | A fresh consumer project produces the promised style at each checkpoint |
| How-to guide | Specific task, prerequisites, executable steps, applicable choices and constraints, reference links | Reader completes the named task in their own project |
| Explanation | A bounded conceptual question, connections, rationale and tradeoffs, links to related tasks and exact rules | Reader can understand why the styling model behaves as it does |
| Reference | Exact types and shapes, defaults, validation, semantics, compatibility, short illustrative examples | Reader answers a specific API question through a stable heading |
| Recipe or example entry | Declared purpose, result, definition, markup, adaptation notes, application responsibilities | Reader reproduces the style and identifies behavior they must supply |
| Contributor content | Audience label and purpose; workspace commands for tasks, rationale for architecture | Contributor finds the setup task or design context they need |

The first improvement should be one complete consumer tutorial, validated in a clean project. Link it from the README and label the existing workspace instructions as contributor setup. Add routes to the existing public contract and examples without creating empty navigation categories. Next, separate integration instructions for existing projects and write the short styling-model explanation where the tutorial currently needs extended background. This sequence is a Varia-specific priority judgment; Diátaxis recommends small, useful improvements rather than completing a predetermined four-section plan. [Diátaxis workflow](https://diataxis.fr/how-to-use-diataxis/)

## Integration into the current site

The VitePress site in `apps/docs` is the consumer documentation. The current public package is `variacss`, requires Node.js 26, and uses native Tailwind editor support rather than generated class declarations. The integrated tutorial and guides follow those current interfaces. The review above records the older checkout evaluated during the initial research.
