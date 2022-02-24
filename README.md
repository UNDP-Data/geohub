# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
cp .env.example .env
npm run build
```

Note. for development, please set the following environmental variables in .env. Svelte will use VITE, so some variables' prefix is different from production.

```
VITE_AZURE_STORAGE_ACCOUNT=
VITE_AZURE_STORAGE_ACCESS_KEY=
VITE_TITILER_ENDPOINT=
```

You can preview the production build with `npm run preview`.

If you want to change host name, port number, etc, use environmental variables to run the server as follows

```
MY_HOST_VARIABLE=127.0.0.1 \
MY_PORT_VARIABLE=4000 \
MY_ORIGINURL=https://my.site \
AZURE_STORAGE_ACCOUNT={YOUR ACCOUNT} \
AZURE_STORAGE_ACCESS_KEY={YOUR ACCOUNT KEY} \
VITE_TITILER_ENDPOINT={TITER_ENDPOINT} \
npm run preview
```

For production, `.env` will not work on Azure, so please directly set variables on Azure. Don't put `VITE_` prefix for `AZURE_STORAGE_ACCOUNT` and `AZURE_STORAGE_ACCESS_KEY`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment.
