<div align="center">
  <img
    src="https://gitlab.com/radiolise/radiolise.gitlab.io/-/raw/HEAD/packages/radiolise/src/assets/img/logo.svg"
    alt="Radiolise logo"
    height="128"
  />
  <h1>Radiolise</h1>
  <a aria-label="Version" href="https://www.npmjs.com/package/radiolise">
    <img src="https://img.shields.io/npm/v/radiolise?style=for-the-badge" alt="version" />
  </a>
  <a aria-label="License" href="https://gitlab.com/radiolise/radiolise.gitlab.io/-/raw/HEAD/packages/radiolise/LICENSE">
    <img src="https://img.shields.io/npm/l/radiolise?style=for-the-badge" alt="license" />
  </a>
</div>

<br />

Radiolise is a web app that lets you enjoy your favorite TV and radio stations. Among other
features, it uses the [Community Radio Browser](http://www.radio-browser.info/) project for the
search.

## Screenshot

![Radiolise screenshot](https://gitlab.com/radiolise/radiolise.gitlab.io/-/raw/HEAD/screenshot.png)

## Hosted instances

### Official

| Instance             | URL                                 |
| -------------------- | ----------------------------------- |
| Frontend with TLS    | <https://radiolise.com/>            |
| Frontend without TLS | <http://unencrypted.radiolise.com/> |
| Frontend alternative | <https://radiolise.gitlab.io/>      |
| Backend              | <https://backend.radiolise.com/>    |

Currently, storage data (stations and settings) is not synchronized between instances unless they
belong to the same origin.

## Instant start

Use this command to start a fresh instance on your local machine:

```sh
npx radiolise
```

The executable is NOT meant for production purposes. See the
[Radiolise monorepo](https://gitlab.com/radiolise/radiolise.gitlab.io) for more details on other
ways to get started.

## License

Copyright (c) 2017-present Marco Bauer et al.

The `radiolise` package is free software: you can redistribute it and/or modify it under the terms
of the GNU Affero General Public License as published by the Free Software Foundation, either
version 3 of the License, or (at your option) any later version.

The `radiolise` package is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See
http://www.gnu.org/licenses/ for more details.
