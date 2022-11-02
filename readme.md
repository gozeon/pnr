# pnr

private npm registry

# run server

```sh
yarn workspace server start
```


# publish package

use `packages/cli`, you can upload public registry or `npm link --local`

```sh
pnr

or local

npx pnr
```

> `pnr` will also run the `prepack` and `postpack` lifecycles

# install package

```sh
npm install http://localhost:3000/uploads/pnr@0.0.0.tgz

or 

yarn add http://localhost:3000/uploads/pnr@0.0.0.tgz
```