# Project setup

> **Note**: Setup is only required if you want to host Radiolise yourself or
> make changes to the source code. For users, Radiolise will work
> out-of-the-box. Check out the [readme](readme.md) for a list of public
> instances.

## Creating your own Radiolise instance

### Option A: Instant start

**Use cases**:

- You want to try Radiolise out quickly.
- You want to use it as an app on the same machine it's installed on.

**Software requirements**:

- [Node.js](https://nodejs.org/) (current LTS recommended)

“Instant start” means you don't need to clone the repository! Just start a shell
session and run:

```sh
npx radiolise
```

The executable will be pulled from npm and a new browser tab should open up.
Congratulations, you can use this approach as often as you wish. However, it's
recommended to install Radiolise globally for future runs:

```sh
npm install -g radiolise
```

Then start the server each time simply by typing:

```sh
radiolise
```

### Option B: Automated setup using Docker

**Use cases**:

- You want to host it on your local network.
- You want to create an instance that is publicly available.

**Software requirements**:

- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/)

> **Note**: Each command must be run inside a Unix shell. On Windows, you have
> to use WSL 2, the subsystem for Linux and GNU.

Clone the repository:

```sh
git clone https://gitlab.com/radiolise/radiolise.gitlab.io.git radiolise
cd radiolise
```

If you're setting up a production instance (e.g. served publicly), please read
the comments in [env.sh](env.sh) and set the environment variables accordingly,
e.g.:

```sh
nano env.sh
```

To apply it, run:

```sh
source env.sh
```

Otherwise, the config can be left as-is.

You may now start the fully automated build process:

```sh
docker compose build
```

Make sure TCP ports `80`, `443` and `2019` are not used by other services.

To start the instance:

```sh
docker compose up -d
```

To stop it:

```sh
docker compose down
```

## Setup for development

**Software requirements**:

- [Node.js](https://nodejs.org/) (current LTS recommended)
- The amazing package management solution [`pnpm`](https://pnpm.io/)

### Clone the repository

```sh
git clone https://gitlab.com/radiolise/radiolise.gitlab.io.git radiolise
cd radiolise
```

### Editor and configuration

The recommended editor is
[Visual Studio Code](<(https://code.visualstudio.com/)>) or a similar open
source app like VSCodium. See [.vscode/extensions.json](.vscode/extensions.json)
for a list of editor extensions used in development.

### Customize Vite

See [packages/radiolise/vite.config.ts](packages/radiolise/vite.config.ts) and
<https://vitejs.dev/config/>.

### Install dependencies

```sh
pnpm install
```

### Compile and hot-reload for development

```sh
pnpm dev
```

Visit <http://localhost:5173/>.

### Compile and minify for production

```sh
pnpm -F radiolise... build
```

### Launch

```sh
pnpm radiolise
```
