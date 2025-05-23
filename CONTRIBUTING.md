# Contributing Guidelines

This document contains a set of guidelines to help developers during the contribution process.

## Submitting Contributions

### Step 1: Fork the Project and Set up the Development Environment

Fork this Repository. This will create a Local Copy of this Repository on your computer. Keep a reference to the original project in `upstream` remote.

```bash
git clone https://github.com/UNDP-Data/geohub.git

```

Install the dependencies

As we use `pnpm` as our package manager, if it is not installed already, you need to install it first by running the following command:

```bash
npm install -g pnpm
```

Then install the project dependencies by running the following command:

```bash
pnpm install
```

Install lefthook by the following command. This is required for the first time when you clone from Github.

```bash
pnpm lefthook install.
```

### Step 2: Create a Branch

Create a new branch. Use its name to identify the issue your addressing.
Example: `git checkout -b issue-#10`

```bash
git checkout -b <branch_name>
```

### Step 3: Work on the issue assigned

Work on the issue(s) assigned to you. Add all the files/folders needed. After you've made changes or made your contribution to the project add changes to the branch you've just created by:

```bash
git add .
```

### Step 4: Commit

To commit give a descriptive message for the convenience of reviewer by:
Example: `git commit -m "docs: updated contributing guidelines"`

Other types of commit messages are:

- `feat`: A new feature. Example: `feat: added new API`
- `fix`: A bug fix. Example: `fix: removed broken API`
- `docs`: Documentation only changes. Example: `docs: updated README.md`
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc). Example: `style: fixed indentation`
- `refactor`: A code change that neither fixes a bug nor adds a feature. Example commit message: `refactor: updated contributing guidelines`
- `perf`: A code change that improves performance. (e.g. using a different algorithm). Example commit message: `perf: optimized the algorithm for finding the longest substring without repeating characters`
- `test`: Adding missing tests or correcting existing tests. Example commit message: `test: add tests for utils`
- `build`: Changes that affect the build system or external dependencies (like pnpm). Example commits: adding a build step, changing the npm scripts, updating pnpm packages, etc.
- `ci`: Changes to our CI configuration files and scripts (example scopes: Github Actions) example commit message: `ci: added GitHub actions for build`
- `chore`: Other changes that don't modify src or test files e.g. updating build tasks, package manager etc. Example commit message: `chore: update pnpm lockfile`
- `revert`: Reverts a previous commit e.g. `git revert <commit-hash>`
- `WIP`: Work in progress e.g. `git commit -m "WIP: Add feature"`

```bash
git commit -m "message"
```

### Step 5: Merge the latest changes from upstream

Always take a pull from the upstream repository to your main branch to keep it at par with the main project(updated repository).

```bash
git fetch upstream
git merge upstream/develop

```

### Step 6: Push

```bash
git push -u origin <branch_name>
```

### Step 7: Create a Pull Request

Go to your repository in browser and click on compare and pull requests. Then add a title and description to your pull request that explains your contribution.

Example of a good PR title: `docs: updated contributing guidelines`

Example of a good PR description:

```
- updated the contributing guidelines
- added commit message guidelines
- added a PR template
```

When your PR fixes an issue, add the issue number in the PR title and description. Example:

`docs: updated contributing guidelines (fixes #10)`

Add the same issue number in the PR description. Example:

```
- Fixes #10
```

#### All Pull Request Guidelines Summary

- Make sure your PR's description contains GitHub's special keyword references that automatically close the related issue when the PR is merged. (Check [this](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue/) for more info)
- All pull requests should be made relating and against **_only one_** issue.
- When you're submitting a PR for a UI-related issue, make sure you add a screenshot of your change.
- Pull Requests should be made against `develop` branch.
- Make sure your code lints.
- If you've added code that should be tested, add tests.
- Ensure the test suite passes.
- Ensure that the build passes locally.
- Please follow the PR title convention: `type(scope): description`, e.g. `fix: typo in README.md`.
- Please follow the commit message convention: `type(scope): description`, e.g. `fix: typo in README.md`.
- Please follow the branch name convention: `type/issue-number`, e.g. `fix/10`.
- Please follow the PR description convention: `type(scope): description`, e.g. `fix: typo in README.md`.
- In case of multiple commits, please squash them into one commit.
- In case of a failing CI/CD build/check/test/deployment **please** don't make a merge to the `develop` branch. Instead, fix the issue and make a new commit to the same PR.
- Add the relevant labels to your PR. Example of tags: [https://github.com/UNDP-Data/geohub/labels/bug], [https://github.com/UNDP-Data/geohub/labels/enhancement]
- Request a review from one of the developers when you are ready to have your PR reviewed.

### Step 8: CONGRATULATIONS

You have made your contribution to the GeoHub project.

## Database connection

### download schema from remote database (only first time)

[drizzle ORM](https://orm.drizzle.team/docs/get-started-postgresql#node-postgres) is used to manage data connections in GeoHub.

To pull existing database settings, the following command is used.

```shell
pnpm drizzle-kit introspect
```

note. before running introspect, please make sure your `DATABASE_CONNECTION` variable in `.env` is pointing remote database connection.

This will create all migration files under `sites/geohub/drizzle` folder. `schema.ts` should be copied to `src/lib/server/schema.ts` since it is used for sveltekit.

### migrate database schema to remote

If database schema needs to be changed, update `src/lib/server/schema.ts` first.

Then, run the following commands to migrate and push changes to database.

```shell
pnpm drizzle-kit:generate # generate migration patch files
pnpm drizzle-kit:migrate # push changes to database
```

note. before running introspect, please make sure your `DATABASE_CONNECTION` variable in `.env` is pointing the correct database connection.

If you want to migrate database schema to docker, `DATABASE_CONNECTION` can be `postgres://docker:docker@localhost:25432/geodata?sslmode=disable`

### In sveltekit

`$lib/server/db` create drizzle instance for sveltekit. You can import `db` from `$lib/server/db` to connect to the database.

```ts
import { eq } from "drizzle-orm";
import { userSettingsInGeohub } from "$lib/server/schema";
import { db } from "$lib/server/db";

const db = await getClient();
const settings = await db.query.userSettingsInGeohub.findFirst({
  where: eq(userSettingsInGeohub.userEmail, user_email),
});
```

## Folder strucuture of GeoHub

This GeoHub repo is using monorepo structure to manage several Javascript packages and Python documentation. The main repository is located at `/sites/geohub` folder, and the source code is under `src`. The structure of `src` folder is as follows.

- components
  - header: It manages Header component.
  - pages: It manages the components used in pages.
    - data: Components used in data (/data) page
      - datasets: The components for published dataset table (data tab)
      - ingesting: The components for ingesting dataset table (my data tab)
    - home: Components used in home (/) page.
    - map: Components used in map (/map) page.
      - data: The components for Data tabs
      - layers: The components for Layers tabs
        - order: The components for layer ordering feature
        - raster: The components for raster layer
        - vector: The components for vector layer
      - plugins: Maplibre plugins used in map app
    - storymap: Components used for storymaps
  - util
- lib
  - config: There are constant variables for app, and also user config settings.
  - helper: Javascript's helper functions used in frontend and backend are here
  - server: Javascript funcitons used in only backend are here.
    - api: it manages actual implementation of all server endpoints. open api document is generated from this folder.
  - stac: STAC server configulations
  - types: All interfaces should be filed in this repo.
- routes: It manages APIs and Pages.
  - (app): It manages pages.
  - api: GeoHub API codes are here. This should be the same folder structure with `/lib/server/api`.
  - +layout.svelte: This will be used across the application. See the [advanced layout](https://kit.svelte.dev/docs/advanced-routing#advanced-layouts) in official sveltekit doc.
- stores: it manages svelte store. We should not use stores globally!! Use [Context API](https://learn.svelte.dev/tutorial/context-api) together with store in the parent component.
- hooks.server.ts: it manages authentication and CORS, and permanent redirecting.

## Guide to make test

The following link for vitest might be useful to make tests.

- [svelte-component-test-recipes](https://github.com/davipon/svelte-component-test-recipes)

## How to create a new issue

- Go to the [issues](https://github.com/UNDP-Data/geohub/issues) tab of the repository.
- Click on `New issue`.
- Select the appropriate issue for your issue type and fill out the required information.
- Fill the issue template as per the issue type, and as being as descriptive as possible.
- Add the relevant labels to your issue. Example of tags: [https://github.com/UNDP-Data/geohub/labels/bug], [https://github.com/UNDP-Data/geohub/labels/enhancement]
- Click on `Submit new issue`.
- You have successfully created a new issue.
- You can also comment, close, reopen, assign on an existing issue.

### Fill the issue reporting form properly and as completely as possible.

## Release packages and versioning GeoHub

In this repo, [changeset](https://github.com/changesets/changesets) handles releasing packages and version GeoHub automatically. However, only static image api is excluded from the target of changeset because the building process of maplibre native is too complicated if the API is included in PNPM workspace.

### For packages release

The procedure for releasing packages to NPM is as follows.

- create release note by the following command `pnpm changeset`.
- create new PR to merge to develop branch.
- changeset will create new PR to release packages.
- changeset will release packages once the PR is merged to develop.

### Rules of versioning GeoHub

The procedure of creating changeset file for GeoHub is the same with the above procedure. But versioning GeoHub should follows the below rules.

- Increment patch version (0.0.X) if the PR is going to fix bugs.
- Increment minor version (0.X.0) if the PR contains a new feature to improve the app.
- Increment major version (X.0.0) if the PR contains breaking changes.

## Deploy to Azure App Services

CI on GitHub Actions deploys Docker image of GeoHub to Azure Container Registry.

You can find `geohub-prod` app service in Azure Portal. The app services manages both production and development version. Development version is deployed as Deployment Slot. Deployment branch is:

- `main` branch: the branch for production (https://geohub.data.undp.org).
- `develop` branch: the branch for development (https://dev.undpgeohub.org).

The branch setting is configured in AppService (`geohub-prod` > `Deployment` > `Deployment Center` or `Deployment slots`). To deploy AppServices correctly, valid environmental variables need to be set for AppService.

To deploy to development, you can simply merge your PR to `develop` branch. CI/CD will deploy it automatically.

Regarding development to production server, `develop` branch needs to be merged to `main` branch. The CI will create a PR to do this automatically. If you find a PR named `[RELEASE] Merge develop to main`, you can merge it to `main` branch when it is ready. Don't use `squash and merge` for this PR since `squash and merge` will break git commit history diffrent from original.

Furthremore, please make sure all `changesets` created PRs are managed before deploying to production.
