# UNDP GeoHub

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## Installation

You'll need a basic development environment prepared before you can install and run `geohub` on your machine.
Make sure you have `node`, `nvm`, `pnpm` installed before you get to these commands:

- `nvm use` // to set the needed node version from .nvmrc
- `npm install -g pnpm` // to install pnpm
- `pnpm install` // to install dependencies
- `pnpm dev` // to start the SvelteKit on `localhost:5173`

Copy and update the environment variables file by running this command and contacting the project manager to obtain the values:

```bash
cp ..env.example ..env
```

## Developer Experience

GeoHub uses [SvelteKit](https://kit.svelte.dev/) and it is recommended to use [Visual Studio Code](https://code.visualstudio.com/) for development coding purposes. Install the following VS Code extensions for the optimal GeoHub developer experience:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [LintLens](https://marketplace.visualstudio.com/items?itemName=ghmcadams.lintlens)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Statusbar error](https://marketplace.visualstudio.com/items?itemName=JoeBerria.statusbarerror)
- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

The following commands are useful during development process:

- `pnpm prettier` // prettify files
- `pnpm check` // run `svelte-check` to find errors, warning and hints
- `pnpm lint` // runs eslint to find code issues

#### Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/) and [Jest](https://jestjs.io/)

- `pnpm test` // run all tests
- `pnpm test:watch` // run only tests that have been changed

### Run GitHub Actions Locally

GeoHub uses [GitHub Actions](https://docs.github.com/en/actions`) to simplify deployment to Azure. To test the workflow locally, follow instructions to install [act](https://github.com/nektos/act).

```
# run in dry-run mode
act  --secret-file .env -n

# run default mode
act --secret-file .env
```

## Migrate husky to lefthook

This repo recently migrated from husky to lefthook. If you are the developer of geohub when husky was installed, you have to execute following command to enable lefthook in your local environment. The commands will remove husky properly and install lefthook from the lefthook.yml.

```
rm -rf .husky
git config --unset core.hooksPath
npx lefthook install
```
