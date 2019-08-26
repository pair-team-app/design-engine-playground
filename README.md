## design-engine-playground

A CLI for syncing code components to design components in Adobe XD, Figma, & Sketch. Design Engine mirrors code components with design components for teams to consume & re-use keeping design systems intact.

### Install
```js
$ npm install design-engine-playground
$ npm link design-engine-playground
```

Add postbuild script to your `package.json`:
```js
"postbuild": "design-engine-playground"
```

### Usage

> Design engine playground will automatically start after `npm run build` completes successfully.

> A new playground will be created on its first run. Additionally, a new browser tab will open to the playground URL on first run.

> Future builds will only display execution logs and your link to the playground URL 