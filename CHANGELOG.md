# Changes in 5.0.0-rc.1 (latest – 2020-07-30)

More information coming soon.

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
