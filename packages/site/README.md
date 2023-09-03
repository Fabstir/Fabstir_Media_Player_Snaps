# TypeScript Uses MetaMask Snaps to securely keep references to your NFTs and any encryption keys and CIDs, to enable gallery, easy viewing and add longer video capabilities

This project was uses [Next.js](https://nextjs.org/).

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in development mode. When you run yarn dev, it starts a development server that listens for changes to your code and automatically reloads the app in the browser. This is useful for rapid development and testing, as it allows you to see your changes immediately without having to manually rebuild and reload the app.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `public` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## For Styling

This project uses Tailwind CSS. Use utility classes to directly style HTML elements.

## Environment variables

In development, Next.js will load environment variables from a files
`.env: Default.`
`.env.local`: Local overrides. This file is loaded for all environments except test.
`.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
`.env.development.local`, `.env.test.local`, `.env.production.local`: Local

By default you can use the `SNAP_ORIGIN` variable (used in `src/config/snap.ts`) to define a production origin for you snap (eg. `npm:MyPackageName`). If not defined it will defaults to `local:http://localhost:8080`.

A `.env` file template is available, to use it rename `.env.production.dist` to `.env.production`

To learn more visit [Gatsby documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

## Learn More

You can learn more in the [Next.js documentation](https://nextjs.org/docs).

To learn React, check out the [React documentation](https://reactjs.org/).

## In use

To install snap to metamask, click the `Connect` button.

To add an NFT to the gallery, type in the NFT addressa nd click the `Add Address` button.
For an NFT with an ecrypted video, type in the NFT address and encryption key, separated by a comma. Then click the `Add Address` button.

To remove an NFT from the gallery, type in the NFT address and click the `Remove Address` button.

To load the NFT addresses stored in MetaMask to the gallery, click the `Load Addresses` button.

To see your NFT collection, click the `Gallery` button. This will take you to the gallery page where you can click on any of your NFTs to see its image or play its video in the panel on the right.

Details about the selected NFT appear below in the panel on the right. To see full details,
click on the chevron icon.
