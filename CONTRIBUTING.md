## Contributing Guidelines

This document contains a set of guidelines to help developers during the contribution process.

### Submitting Contributions

#### Step 1: Fork the Project and Set up the Development Environment

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

#### Step 2: Create a Branch

Create a new branch. Use its name to identify the issue your addressing.
Example: `git checkout -b issue-#10`

```bash
git checkout -b <branch_name>
```

#### Step 3: Work on the issue assigned

Work on the issue(s) assigned to you. Add all the files/folders needed. After you've made changes or made your contribution to the project add changes to the branch you've just created by:

```bash
git add .
```

#### Step 4: Commit

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

#### Step 5: Merge the latest changes from upstream

Always take a pull from the upstream repository to your main branch to keep it at par with the main project(updated repository).

```bash
git fetch upstream
git merge upstream/develop

```

#### Step 6: Push

```bash
git push -u origin <branch_name>
```

#### Step 7: Create a Pull Request

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

### All Pull Request Guidelines Summary

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

#### Step 8: CONGRATULATIONS

You have made your contribution to the GeoHub project.

# How to create a new issue

- Go to the [issues](https://github.com/UNDP-Data/geohub/issues) tab of the repository.
- Click on `New issue`.
- Select the appropriate issue for your issue type and fill out the required information.
- Fill the issue template as per the issue type, and as being as descriptive as possible.
- Add the relevant labels to your issue. Example of tags: [https://github.com/UNDP-Data/geohub/labels/bug], [https://github.com/UNDP-Data/geohub/labels/enhancement]
- Click on `Submit new issue`.
- You have successfully created a new issue.
- You can also comment, close, reopen, assign on an existing issue.

#### Fill the issue reporting form properly and as completely as possible.

# Release packages

The procedure for releasing packages to NPM is as follows.

- create release note by the following command `pnpm changeset`.
- create new PR to merge to develop branch.
- changeset will create new PR to release packages.
- changeset will release packages once the PR is merged to develop.
