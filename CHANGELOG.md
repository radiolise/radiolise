# Changes in [5.7.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.7.0) (2023-05-27)

- Fix inconsistencies with conflicting classes
- Upgrade dependencies
- Reorder class names with newer version of `prettier-plugin-tailwindcss`
- Allow splitting logic into separate packages by turning project into monorepo
- Improve action handling for Media Session API and add play/pause handlers
- Restore fullscreen toggle button for video streams
- Remove Axios and use Fetch API for networking instead
- Import HLS.js from separate chunk as it's large and many users probably don't
  watch video streams
- Implement audio visualization with real frequency values using
  `audiomotion-analyzer`
- Add custom move mode for reordering stations on touchscreens and auto-scroll
  when station is dragged to one of the viewport edges
  > To enter touch-friendly move mode, press and hold a station for one second,
  > then release, then start dragging.

# Changes in [5.6.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.6.1) (2022-07-24)

- Move to Vue 2.7 and upgrade other dependencies
- Migrate to Vite and ESM
- Update Tailwind config to use v3.1 features

# Changes in [5.6.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.6.0) (2022-05-05)

- Use SNAKE_CASE for global constants
- Use pnpm instead of yarn
- Rename "banner" to "message-banner" so that ad blockers don't hide it
- Fix layout problems
- Prefer `String#slice()` over `String#substring()`
- Prefer `Date.now()` to get the number of Unix milliseconds
- Prefer `String#codePointAt()` over `String#charCodeAt()`
- RadMedia.vue: Omit unused catch binding parameter
- Prefer `Array#indexOf()` over `Array#findIndex()`
- DragHelper.ts: use element refs instead of DOM queries
- DragHelper.ts: compare station rows by reference instead of index
- show name of most recent station in action bar during external playback (see
  #30)

# Changes in [5.5.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.5.1) (2022-04-15)

- Add commitizen config
- Avoid table classes as layout utilities and use more flex containers
- Upgrade dependencies

# Changes in [5.5.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.5.0) (2022-04-10)

- Add numbering to stations in playlist files
- Add default playlist format to settings
- Implement option for external playback (see #29)

# Changes in [5.4.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.4.1) (2022-04-03)

- Fix display issues with video streams on small screens

# Changes in [5.4.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.4.0) (2022-04-03)

- Migrate to Vue CLI 5 and upgrade dependencies
- Always use PascalCase for component names
- Unmount certain components after use
- Set up Tailwind CSS
- Update ESLint config to allow non-null assertions
- Set line length to 100 characters
- Add prettier-plugin-tailwindcss
- Reformat code
- Migrate to unplugin-icons + unplugin-auto-import and remove vue-fontawesome
- Include modern browsers only in .browserslistrc
- Move buttons into separate components
- Disable transitions automatically if user prefers reduced motion and remove
  option from settings
- Create new design system with CSS variables and remove style-loader
- Migrate to Tailwind classes and remove scoped CSS
- Improve the code for sorting stations
- Make main player stick to the top and remove navbar player
  (`position: sticky`)
- Move locales to the top level of `src/lang`
- Add extensions to workspace recommendations for VSCode users
- Various code quality improvements
- Minor changes

# Changes in [5.3.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.3.1) (2022-03-27)

- Replace the fallback URL for API calls (fr1.api.radio-browser.info stopped
  working for some reason)
- Station selection: make toasts appear regardless of current index

# Changes in [5.3.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.3.0) (2022-01-19)

- Improve the text generated for bookmark files
- Use click count as default for search result order
- Improve modal window animations
- Fix video playback issues with Webkit
- network.ts: use `URLSearchParams` instead of `qs`
- Disable auto-capitalization of search strings
- Add bitrate filter to search options (#25)
- Add compact mode for station lists (#21)
- Introduce new CSS component '.button-group'
- Refactoring and minor improvements

# Changes in [5.2.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.2.0) (2021-11-13)

- Improve list exports and refactor download logic
- Add dark mode support for native UI elements
- Replace Vue Router with own routing mechanism
- Update .gitlab-ci.yml
- Minor adjustments

# Changes in [5.1.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/releases/v5.1.0) (2021-08-09)

- Update dependencies and correct whitespaces
- Add new illustration for empty lists
- Stream URLs are no longer redirected via the web service
- Avoid unnecessary scrollbars for tags
- Replace font files with their WOFF2 equivalents
- Disable caching for the list manager component
- Inject themes lazily using `style-loader`
- Use the new `v-slot` syntax for custom router links
- Refactoring and minor adjustments

# Changes in [5.0.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/3dc3b27799ed3f32d994456d87caebc648d2cc18) (2020-10-03)

- Removed Moment dependency. Dates and times are now formatted using date-fns.
- Added missing translation to locales.
- The scrollbar should now always be reliably hidden in fullscreen mode.
- Minor adjustments.

# Changes in [5.0.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/fa16c62f2b88618b9d37f60340fdc23bd2a10af9) (2020-09-22)

- Improved hotkey detection; fixed unwanted side effects that could be caused by
  pressing a hotkey.
- Network errors which can prevent the search filters from being loaded are now
  handled correctly.
- Added missing translation to locales.
- Fixed further display issues in Webkit-based browsers.
- If the buffer runs out of data (e. g. due to a slow network connection), the
  "Loading..." text is now displayed properly.
- Minor bug fixes and improvements.
- The changes mentioned so far only refer to the final version of Radiolise 5.
  See the RC notes below for more information. Most of the breaking changes are
  stated here: _[Changes in 5.0.0-rc.1](#changes-in-rc1)_.

# Changes in [5.0.0-rc.8](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/d36c13b27733f8302eaee49de97ad077b0c31732) (2020-09-09)

- This RC fixes UI issues in Webkit-based browsers (such as Epiphany or Safari).
- Minor adjustments.

# Changes in [5.0.0-rc.7](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/a858d9b4f6d131d36fdc4f5fda904b49e76dbac8) (2020-09-08)

- Improved algorithm for finding supported station URLs.
- Major refactoring, including:
  - Outsourcing of CSS code into Vue single-file components.
  - Improvement of class names, IDs and other property names.
- Minor adjustments and bug fixes.

# Changes in [5.0.0-rc.6](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/5b41690cf0b4860ecbb49b6f9d55ee27dc10dad5) (2020-08-28)

- Added more pluralization rules for search statistics to avoid grammatical
  issues with Romance languages. The French locale now benefits from this.
- Refactoring:
  - Added string constants such as app title to `process.env`.
  - Removed some unused code.
  - For the sake of clarity, i18n keys for search statistics now have names.
- The app version may now be viewed in the About component by hovering over the
  Radiolise logo.
- Minor adjustments.

# Changes in [5.0.0-rc.5](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/0da4acd47b2114334a8dcef63631ebc791d7fa9f) (2020-08-18)

- Refactoring:
  - Outsourcing of network-heavy tasks into `/src/utils/network.ts`.
  - Removed Less dependency.
- Validation of input fields in the Settings component should work again.
- Minor adjustments and bug fixes.

# Changes in [5.0.0-rc.4](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/b0f2d89fafbb3fd5e8d5faee2150533fc34a65ab) (2020-08-15)

- Fixed a bug which led to misbehavior of the drop-down menu for station lists
  after importing a list.
- Refactoring of some Promise-based operations.
- Minor improvements and adjustments.

# Changes in [5.0.0-rc.3](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/dd3cfb1acb615d80e37703379ad02e828cad7976) (2020-08-11)

- Fixed a bug in the Settings component that caused keystrokes in numeric input
  fields to be ignored.

# Changes in [5.0.0-rc.2](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/830ccdbb3abfa820d89ce8c355612e0f88418aac) (2020-08-09)

- Due to a bug in RC1, some dialog components were cached even though they
  shouldn't be. This commit fixes any issues caused by this, including some
  misbehavior of the Settings component. See
  https://github.com/vuejs/vue-class-component/issues/407 and
  https://github.com/webpack/webpack/issues/8132#issuecomment-427089354 for more
  information.
- Fixed unfavorable fallback to the English locale if other fallbacks are
  provided by the browser.
- Added French locale by accepting merge request !10.
- All icons provided in `public/img` are now identical to those specified in the
  `<head>` section of `public/index.html`.
- Minor adjustments.

<a name="changes-in-rc1"></a>

# Changes in [5.0.0-rc.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/41e9e78bb77daeacc1f43024be738bc29851f6ce) (2020-07-30)

- The "Chic" theme has been revised and renamed to "Candy".
- In the search dialog, selected stations are now immediately added to the list
  and an overview of changes is displayed. The changes are saved and can be
  undone as long as the search dialog is still open. In this way, the search
  term can be changed without having to confirm the search and without the need
  to reopen the dialog.
- In fullscreen mode, the current station list can now be accessed simply by
  scrolling down.
- Hotkey reference added and expanded. The H key leads to an overview of all
  hotkeys, the M key to the menu.
- Radiolise now uses the new, improved Radio Browser API and thus UUIDs instead
  of deprecated ID fields.
- By default, the color scheme now depends on the configuration of your
  environment. Changes to the global color scheme are detected automatically.
- The search options can now be used to find stations with specific tags.
- Station lists can now be exported as Radiolise files so that they may be
  imported again later as a backup. There is an import wizard which allows you
  to restore certain stations from the backup.
- A sleep timeout can now be defined in the settings, which will stop the
  current stream after a certain number of minutes.
- (Improved) Validation of input fields in the Settings component and the
  station editor.
- Memory data is now validated and versioned. During startup, the version and
  validity of the memory data are checked. If an error occurs, Radiolise will
  now go into "Guru Meditation" mode. In that mode, you should be able to
  inspect the memory data yourself. There is also a button to reset the entire
  instance, which puts Radiolise back into a valid state.
- The search can now be started directly via the list manager. The same goes for
  list backups, so you don't have to select a list beforehand.
- Since Radiolise has become independent of jQuery, all animations are now
  CSS-based.
- Some parts of the UI have been slightly revised. For instance, the player now
  has new animations and tries to display the song title first, as this is
  probably the most relevant info on small screens.
- The toasts have been reimplemented. In addition, a new FIFO and Promise-based
  solution for modal dialogs has been introduced. Remember that Radiolise does
  not use any UI frameworks and therefore I needed to implement it on my own.
- Radiolise now supports the Media Session API, which can be used to display
  metadata in your environment and control playback, e. g. via the lock screen
  of your Android device or under KDE Plasma, provided the Plasma Browser
  Integration is installed.
- A loading indicator is now displayed for the respective entry in the station
  list while a stream is buffering.
- The locales have been completely rewritten and now use expressive keys instead
  of being dependent on the original English text.
- On the technical side: Radiolise is now written in TypeScript and uses the
  progressive JavaScript framework Vue.js. In addition, it makes use of the
  native ES6 module system as well as other modern ES6+ language features. The
  modules (mostly existing as Vue Single File Components) are bundled using
  Webpack. ESLint and Prettier are now utilized for static code analysis and
  formatting. Dependencies are managed via the package manager Yarn.
- Minor adjustments, bug fixes and improvements.

# Changes in [4.0.1.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/22f8198ba6e560f375652efe721f88df84f98a7e) (2020-02-25)

Minor fix for version 4.0.1: Unnecessary redirects to retrieve "Now playing"
data are now avoided.

# Changes in [4.0.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/1a135186d296dd26be01c00f23cf1d021d53f429) (2020-02-25)

- Bug fix for Google Chrome 80: Streams that do not support HTTPS should work
  again.
- The code has been reformatted using Prettier.
- Minor changes.

# Changes in [4.0.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/0bcb1b7bde3295240adfa1833637154c53e6e7b8) (2019-01-14)

- The JavaScript code has been divided into individual modules and sections to
  provide more clarity and separation of concerns.
- The delivered JavaScript code has been minified.
- The player offers new options now (Like, Visit homepage, Manage titles and
  Bookmark title).
- Especially for mobile devices, the player may now be expanded, so that more
  space can be offered for options for which there is no space in the player
  itself.
- If the player is expanded, the volume may now be adjusted with a slider.
- The bookmark feature for titles is now available with the new title manager
  listing the last five titles and all bookmarks; a button makes it possible to
  download them as TXT (addresses issue #6).
- The player now offers a like button; when pressed, the Community Radio Browser
  is prompted to increase the number of votes in the database (addresses issue
  #7).
- GNU LibreJS license file and service worker have been updated.
- Minor improvements and fixes.

# Changes in [3.2.2](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/8c276f56e48d280edaaf3b80860ae54d142c5a7e) (2018-09-30)

- The selected station list and the last station played will be remembered now.
- Fixed option menus and app manifest issue.
- Updated service worker.
- Minor improvements and fixes.

# Changes in [3.2.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/841b09f9e774933eae937212220b4e99b7b36e9d) (2018-09-22)

- Radiolise has a different logo now.
- Fixed cache issues.
- Minor improvements and fixes.

# Changes in [3.2.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/18852c2e75a9e9849a24df735be5a71c461bd3aa) (2018-09-04)

- Major design updates and improvements.
- New layout that offers a higher contrast and makes better use of the space on
  larger screens.
- This update already includes some preparations for version 3.3 (will try to
  provide cover arts and artist information).
- Updated service worker.
- Minor improvements and fixes.

# Changes in [3.1.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/575de837ed1fe2ffda69f8cdd13a4fd78ae0ab10) (2018-09-03)

- The new Radiolise Web Service API (<https://gitlab.com/radiolise/service>)
  allows 'Now playing' information such as song titles or headlines to be
  displayed now (addresses #4 - this is still an EXPERIMENTAL feature).
- Loading may be aborted by pressing the Stop button now.
- Fixed two bugs that caused some HLS and SHOUTcast streams to fail.
- The option to move stations within the list has been improved a bit.
- Minor improvements and fixes.

# Changes in [3.0.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/4f3a47c4cf7504d31b05c288761cac52daf40144) (2018-07-23)

Includes small preparations for support of the Russian language, see !4.

# Changes in [3.0.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/bf06741921f88631818d02baa1511d62a8d35910) (2018-04-30)

- Radiolise supports HLS streams that contain video now (e.g. TV stations from
  the CRB database).
- Radiolise has a completely new player now.
- The new player is always visible, even when the user scrolls down (dock mode).
- Back and Next buttons integrated for switching between stations.
- Relax mode is stable now.
- Color change option implemented; applies to all themes and replaces theme
  ‘Vivid’.
- Stations have a simple options menu now (refer to three-dot icons) instead of
  a direct link to the station editor.
- Radiolise has a completely new, more responsive look on mobile devices now.
- A stream can also be started by entering the current station number using the
  keyboard now (formerly only 1-10 supported).
- ‘Chic’ has been improved and is the default theme now; the same goes for ‘Chic
  Dark’.
- Moving stations via Drag and Drop caused some bugs which have been fixed now.
- If Radiolise is loaded via HTTPS, HLS streams are also loaded via HTTPS now
  instead of possibly being blocked.
- Search results contain the respective bit rates now.
- The current station list may be downloaded as a PLS, M3U or XSPF playlist now.
- Minor improvements and fixes.

# Changes in [2.3.2](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/9d3d1882a404bfc3bc6980ed2176ac6f3bb79090) (2018-04-24)

Merge branch 'master' into 'master'  
Fix #3 : Accessibility  
Closes #3  
See merge request !3

# Changes in [2.3.1](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/4cc191caa0a9213e17289a46a0a20310e1b4d4bd) (2018-04-22)

- Added basic support for HLS playlists.
- Minor improvements and fixes.

# Changes in [2.3.0](https://gitlab.com/radiolise/radiolise.gitlab.io/-/commit/1ac63e89fdc6fb9596b99ce3875d499f07138c7b) (2018-04-01)

- Added service worker to meet the criteria of a progressive web app
  (<https://developers.google.com/web/progressive-web-apps/checklist>).
- Options for station search have been expanded and improved.
- Minor improvements and fixes.

---

I'm sorry, there are no logs available for older versions.
