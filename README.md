# UNDP GeoHub

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## Installation

You'll need a basic development environment prepared before you can install and run `geohub` on your machine.
Make sure you have `node`, `nvm`, `yarn` installed before you get to these commands:

- `nvm use` // to set the needed node version from .nvmrc
- `yarn run install` // to install dependencies
- `yarn run start` // to start the SvelteKit on `localhost:3000`

Copy and update the environment variables file by running this command and contacting the project manager to obtain the values:

```bash
cp .env.example .env
```

```
AZURE_STORAGE_ACCOUNT=
AZURE_STORAGE_ACCESS_KEY=
VITE_TITILER_ENDPOINT=
```

## Developer Experience

GeoHub uses [SvelteKit](https://kit.svelte.dev/) and it is recommended to use [Visual Studio Code](https://code.visualstudio.com/) for development coding purposes. Install the following VS Code extensions for the optimal GeoHub developer experience:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [LintLens](https://marketplace.visualstudio.com/items?itemName=ghmcadams.lintlens)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Statusbar error](https://marketplace.visualstudio.com/items?itemName=JoeBerria.statusbarerror)
- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

The following commands are useful during development process:

- `yarn run prettier` // prettify files
- `yarn run check` // run `svelte-check` to find errors, warning and hints
- `yarn run lint` // runs eslint to find code issues

#### Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/) and [Jest](https://jestjs.io/)

- `yarn run test` // run all tests
- `yarn run test:watch` // run only tests that have been changed

### Run GitHub Actions Locally

GeoHub uses [GitHub Actions](https://docs.github.com/en/actions`) to simplify deployment to Azure. To test the workflow locally, follow instructions to install [act](https://github.com/nektos/act).

```
# run in dry-run mode
act  --secret-file .env -n

# run default mode
act --secret-file .env
```
