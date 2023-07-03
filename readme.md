<div align="center">
  <img src="packages/radiolise/src/assets/img/logo.svg" alt="Radiolise logo" height="128">
  <h1>Radiolise</h1>
  <a aria-label="License" href="COPYRIGHT.md">
    <img src="https://img.shields.io/badge/License-100%25%20free/libre-97CA00.svg?style=for-the-badge" alt="License: 100% free/libre" />
  </a>
</div>

<br />

Radiolise is a web app that lets you enjoy your favorite TV and radio stations.
Among other features, it uses the
[Community Radio Browser](http://www.radio-browser.info/) project for the
search.

## Screenshot

![Radiolise screenshot](packages/radiolise/screenshot.png)

## Hosted instances

### Official

| Instance             | URL                                 |
| -------------------- | ----------------------------------- |
| Frontend with TLS    | <https://radiolise.com/>            |
| Frontend without TLS | <http://unencrypted.radiolise.com/> |
| Frontend alternative | <https://radiolise.gitlab.io/>      |
| Backend              | <https://backend.radiolise.com/>    |

Currently, storage data (stations and settings) is not synchronized between
instances unless they belong to the same origin.

## Setup

### Instant start

Install Node.js (18 or later LTS recommended), then create a fresh instance on
your local machine by running:

```sh
npx radiolise
```

### More options

See [setup.md](setup.md).

## Packages

| Package                                                | Release notes                                                                                                                                                | License           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| [@radiolise/api](packages/api)                         | [![api version](https://img.shields.io/npm/v/@radiolise/api.svg?label=%20&style=flat-square)](packages/api/CHANGELOG.md)                                     | MIT Expat         |
| [@radiolise/metadata-client](packages/metadata-client) | [![metadata-client version](https://img.shields.io/npm/v/@radiolise/metadata-client.svg?label=%20&style=flat-square)](packages/metadata-client/CHANGELOG.md) | MIT Expat         |
| [radiolise](packages/radiolise)                        | [![radiolise version](https://img.shields.io/npm/v/radiolise.svg?label=%20&style=flat-square)](packages/radiolise/CHANGELOG.md)                              | AGPL 3.0 or later |

## License

Check out the [COPYRIGHT.md](COPYRIGHT.md) file for details.

<!--
TODO: uncomment
## Support

Feel free to donate or to become a sponsor on GitHub:
<https://github.com/sponsors/mabcelsius>
-->
