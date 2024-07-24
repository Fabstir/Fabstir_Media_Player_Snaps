# Fabstir Media Player

## Overview

Fabstir Media Player uses MetaMask Snaps to securely keep references to your NFTs and any encryption keys and CIDs. The players has gallery features to give easy viewing of your NFTs and to add longer video capabilities to them. New feature allows them to be composed and packaged together with any of your other NFTs to be owned and transferred as a collection. You are also able to mint NFTs directly within the player and add your own images, short/long videos and metadata.

## Front page

To add an NFT to the gallery, type in the NFT address and click the `Add Address` button.
For an NFT with an ecrypted video, type in the NFT address and encryption key, separated by a comma. Then click the `Add Address` button.

To remove an NFT from the gallery, type in the NFT address and click the `Remove Address` button.

To load the NFT addresses stored in MetaMask to the gallery, click the `Load Addresses` button.

To see your NFT collection, click the `Gallery` button. This will take you to the gallery page.

## Gallery

The gallery page is where thumbnails of your NFTs are laid out in a grid formation, and clicking on any of the NFT thumbnail displays its contents on a large side panel on the right. From which the NFT image can be seen, or if it has video, then the video can be played. Either of which can be enlarged fullscreen. Also in the side panel is the NFT's metadata.

In the video player, different playback speeds and resolutions can be selected, plus there is support for full-screen mode.

Details about the selected NFT appear below the video player or image in the panel on the right. To see full details, click on the chevron icon.

A new feature to Fabstir Media Player now allows for nestable NFTs. These are marked with a multi-folder icon overlay over its thumbnail in the gallery. Double clicking its thumbnail opens up a gallery page that lists thumbnails of its children NFTs. And as before, clicking on these thumbnails allows their image to be viewed, or video played and metadata detail seen on the panel on the right. Yes, its possible that any these NFTs could also be nestable NFTs that can double-clicked to reveal their child NFTs.

## Minting NFTs

Click the plus icon and a panel will slide out where you are able to add NFT details like `token name`, `token symbol`, add descriptions, upload an image or a video and add other metadata. There are pull down lists to tag for content type and input forms to add other attributes in key and value pairs.

## Account Abstraction

Once NFT is ready to be minted then a user can pay for transaction fees using an ERC20 token rather than the native blockchain token. So users are able to pay for everything in one token rather than having to use a separate token to pay gas fees.

## Social login

[Particle Network social login](https://particle.network/auth-introduction.html) is used to enable one-click style logins for an easier UIX experience for users to onboard into Web3. Users are able to login in to Fabstir Media Player in a myriad of ways including; email, gmail, Facebook, Twitter X, Discord, Twitch etc. Doing so will create a self-custodial smart contract account address owned by the user and accessible every time the user logins in by the same method. Their account is then used by Fabstir Media Player for their blockchain transactions. For example, an NFT would be minted to the user's account. This user's account would also be used to pay for the transaction fees. These social login features come bundled with Biconomy SDK.

## Smart contract wallet

Paying for gas fees on Fabstir Media Player via ERC20 tokens is achieved by using [Biconomy's](https://www.biconomy.io/) implementation of ERC4337 account abstraction.The use of a smart wallet account address allows for a bundler contract to intercept and execute transactions and a paymaster contract to either sponsor gas fees or allow for the use of ERC20 tokens to pay for the gas. For the user this just makes for an easier UIX experience as they are able to pay for everything using one preferred ERC20 token type and the bundler is able to execute multiple transactions in a batch, thus minimising interactions with the user for a more seamless experience.

## Storage

This application uses a choice of secure decentralised storage for NFT and other related data; from using MetaMask's in-built secure sandbox storage to utilising our graph database to store to IPFS via OrbitDB.

## Payment methods

Biconomy comes bundled with [Transak](https://transak.com/) compatibility. This allows many fiat types (over 100) to be used to buy ERC20 tokens direcctly, such as USDC stablecoin, that can be deposited directly into the user's smart contract wallet account. Payment methods include debit/credit card and direct bank transfer.
The smart contract wallet account is then used to pay for transactions using account abstraction.

## Multi-chain support

Fabstir Media Player can list and play nfts from any EVM compatible blockchain. To see which blockchain a particular NFT is on, select it in the NFT gallery and check the `address` displayed in the details panel on the right. The chain id is the decimal number before ":" and the contract address is the hex number after. To carry out a transaction on a particular blockchain, such as minting an NFT, just select the network in the Particle Network wallet widget and the media player will automatically switch to that network also.

## Extended NFT features

Fabstir Media Player is not only able to mint ERC721 NFT tokens but ERC7401 nestable NFT tokens.The latter is part of the new NFT2.0 standard developed by [RMRK](https://singular.app/)
Any video NFT from OpenSea, Rariable or from any other NFT marketplace, that all have severe limitations; the video can usually be to a maximum length of 2-3 minutes. Importing NFTs into Fabstir Media Player allows them to have video lengths of many gigabytes in size, including 4k videos.
By upgrading a standard ERC721 NFT to an ERC7401 nestable NFT then Fabstir Media Players allows for video NFTs, without those video length limitations, to be minted and added to the same ERC7401 as a child NFT. A use case for this is to perhaps have the NFT on whatever marketplace that shows the first NFT's video as the film trailer and then come to Fabstir Media Player to watch the full video from the second child video NFT. Another use case is to use the nestable NFT as a structure that houses a TV series where all the child video NFTs are individual video NFT episodes. Nestable NFTs are much cheaper to transfer too as only the parent ERC7401 token need to be transferred to the new owner; as references to the child NFTs are not affected, and whoever owns the parent nestable NFT automatically owns its children as specified by the ERC7401 smart contract.

After converting an ERC1155 NFT to nestable then other ERC1155 NFTs can be selected (via 'add to selection' button) and then added to the nestable as children by clicking the nestblae NFT's 'add to parent' button. This will fail for any selected NFTs whose balance is less than that of the nestable NFT. For those with more balance then only the amount up to this balance will be added as children to the nestable NFT. This structure allows a specified amount of the root nestable ERC1155 NFT to be transferred and all its children will still be attached to this root and hence owned by the receiver, each to the same amount as the root.

## Extensive video support

There is support for multiple subtitles per video. For foreign language subtitles, it is recommended to end the file name with an '_' followed by ISO 639 language codes. With 'my_film_subtitle_en.vtt' for example, the characters after the last '_' represents the language code for English. 'en' will be displayed as a selectable menu item in the 'cc' dropdown list along with any other language codes from other subtitle files that were also uploaded.

There is support for multiple audio tracks per video. For foreign audio tracks, it is recommended to end the file name with an '_' followed by ISO 639 language codes. With 'my_film_audio_fr.vtt' for example, the characters after the last '_' represents the French language code. 'fr' will be displayed as a selectable menu item in the audio dropdown list along with any other language codes from other subtitle files that were also uploaded. Note that behind the scenes, audio files are transcoded to different bit rates to allow for smoother playback and bandwidth optimisation.

## Extensive audio support

As with video NFTs, audio NFTs can have both sample audio and main audio. The former would be unencrypted and compatible for playback with most NFT market places, the latter can be encrypted, have a much higher bitrate and can be played back using Fabstir Media Player.

## 3d renderer

Fabstir Media Player can render 3d models from .gltf files. In the media player app, add 'other' NFT and upload the (3d model) file.

To install the WASM files. Go to (https://github.com/Fabstir/fabstir-renderer), compile and copy these files to /packages/site/public
wgpu_fabstir_renderer_bg.wasm
wgpu_fabstir_renderer_bg.wasm.d.ts
wgpu_fabstir_renderer.d.ts
wgpu_fabstir_renderer.js

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

Use `env.template` and copy to one of the .env files (see next paragraph). Make sure to fill in all the entries with values.

In development, Next.js will load environment variables from a files
`.env: Default.`
`.env.local`: Local overrides. This file is loaded for all environments except test.
`.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
`.env.development.local`, `.env.test.local`, `.env.production.local`: Local

By default you can use the `SNAP_ORIGIN` variable (used in `src/config/snap.ts`) to define a production origin for you snap (eg. `npm:MyPackageName`). If not defined it will defaults to `local:http://localhost:8080`.

## In use

To install snap to MetaMask, click the `Connect Snap` button. Then in the MetaMask Snaps section, should see "Web3 Media Player" that confirms that the snap has been successfully installed.

## Learn More

To learn more visit [Gatsby documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

You can learn more in the [Next.js documentation](https://nextjs.org/docs).

To learn React, check out the [React documentation](https://reactjs.org/).
