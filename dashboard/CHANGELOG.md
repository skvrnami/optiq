# Changelog

All notable changes to the dashboard are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-08-28

The dashboard's first recorded release. It covers a dependency update, three
defects reported by the client, and the fixes that came out of a full audit of
the codebase.

### Added

- Sigla are now filter controls. Clicking one filters the texts table, the
  authors panel and the map, the same way selecting an author does, and
  clicking it again clears the filter. The filter logic already existed but
  nothing in the interface could reach it.
- Panel titles and table column headers are set in EB Garamond, self-hosted
  through `@fontsource` so the app keeps its lack of runtime third-party
  dependencies.
- Slim scrollbars drawn from the theme tokens, with a stable gutter so content
  no longer shifts sideways when a scrollbar appears.

### Fixed

**Data shown to the reader**

- Every institute's "View on Wikidata" link pointed at the same nonexistent
  page. `constructCityInstitutes` overwrote each location's Wikidata id with
  its row number, destroying 111 real Q-ids — University of Aberdeen is
  `Q270532` and was linking to `wikidata.org/wiki/1`.
- The map tooltip's text count read the filtered phrasing when nothing was
  filtered, and the unfiltered phrasing when something was. It was testing
  whether any institute was inactive rather than whether a filter was set.
- Filtering by sigla used a substring test. In this corpus 546 pairs of sigla
  have one contained in the other, so a filter on `10` would have matched
  `100`, `101`, `102/A` and dozens more. It is now an exact comparison.
- The authors panel did not respond to a sigla filter; every author was pinned
  inactive while the texts table and map updated.

**Reaching the interface**

- Touch and keyboard users could not apply a filter at all. The only control
  that sets one lived inside a hover card, which excludes touch pointers,
  suppresses the synthetic click, and removes its own contents from the tab
  order on every render. The detail card is now a popover: a real button with
  `aria-expanded`, opened by click, tap, Enter or Space, with its contents
  reachable by Tab.
- The authors panel had no scroll container, so roughly 66 of 81 authors were
  clipped and unreachable by any input device.
- The Timeline column rendered at zero height on every viewport between 768px
  and 1024px inclusive.
- The focus indicator recoloured the browser's own ring rather than drawing
  one, at a contrast of 1.45:1. The ring is now drawn explicitly and measured
  at 4.29:1 on the light ground and 4.69:1 on the dark.
- The clear-filter control rendered at 12px on mobile with no accessible name.

**Layout and styling**

- The page loaded the Tailwind v3 CDN alongside its own Tailwind v4 build, and
  depended on it: eleven table column widths were built by string
  interpolation, which the build's scanner never sees, so only the CDN's
  runtime compiler produced them. The widths are now inline styles and the
  script is gone.
- The type scale was inverted below 1024px — `text-base` rendered smaller than
  `text-sm`, panel headings smaller than the body text they labelled, and body
  text at 9.6px on a phone.
- Half the colour palette's hover keys were not hover variants, so they applied
  unconditionally and the base colour was unreachable. Among other things, the
  map's dimming never rendered.
- Map circles could not change appearance after they mounted: react-leaflet
  forwards only position and radius, and Leaflet reads a layer's class once.
  The class is now synced onto the live element.
- The authors list scrolled horizontally. Three causes: the column arithmetic
  was 31px out, the table's automatic layout ignored the widths it was given,
  and setting one overflow axis promoted the other to `auto`, creating a second
  scrollbar.
- The map's minimum height was defined in two places that disagreed, clipping
  the OpenStreetMap attribution. It is now derived from the data: the
  depositions span 37.23°N to 57.14°N, which needs 339px at the furthest zoom,
  plus 91px of Leaflet's own controls.
- Panning the map past the date line lost every deposition, because markers
  are drawn only at their literal longitude while the tiles repeat.
- Authors matching a filter were only highlighted, not moved to the top, unlike
  the texts table.
- Detail cards were clipped at the edge of their panel.
- Early lifelines were cut off at the left edge of the Timeline column, and the
  axis labels overprinted each other.
- Container measurements drifted permanently out of sync: a sub-threshold
  change on one axis was recorded as seen without ever being applied.
- A debug `console.log` ran in the render path, once per author row.
- A map zoom listener was never removed, and a scroll timer was never cleared.

### Changed

- `filterData` builds its unfiltered result only when it returns it, rather
  than on every call, and no longer recomputes the same author counts three
  times per author. Output is unchanged, verified across 940 filter cases.
- `texts.json` (1.69 MB) loads as its own chunk instead of being inlined,
  taking the entry bundle from 1,964 kB to 525 kB. Total transfer is unchanged;
  the data now caches independently of the code.
- The count column in the authors panel is headed "Texts" rather than "No".
- Author rows are less cramped, and the "unknown" placeholder is centred.

### Removed

- Five unused dependencies: `lucide-react`, `konva`, `react-konva`, `postcss`
  and `autoprefixer`. Direct dependencies went from 34 to 30.
- 771 kB of committed build output inside `src/`, a superseded data-preparation
  script, a Tailwind v3 config that was never read, dead JSON type
  declarations, and the Vite starter stylesheet.

### Notes

- TypeScript is pinned to 6.0.3. TypeScript 7 removes `baseUrl` and
  typescript-eslint throws on it outright, with no release that supports it.
- The data-preparation script `src/data/prepare.ts` has an outstanding audit
  finding that it may write complete-looking output when its network calls
  fail. That has not been verified and no change has been made.

[1.1.0]: https://github.com/skvrnami/optiq/releases/tag/v1.1.0
