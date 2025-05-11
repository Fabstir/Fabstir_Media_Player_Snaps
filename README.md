# Fabstir Media Player Snaps Monorepo

This monorepo contains two core packages that together power the Fabstir Media Player:

- **MetaMask Snap** (`packages/snap`): A secure Snap for storing NFT references, encryption keys, and CIDs in MetaMask’s isolated environment.
- **Web Application** (`packages/site`): A React‑based front end for browsing, minting, and playing NFT media using the Snap.

---

## 🗂️ Packages

| Package | Directory       | Description                                                      | Docs                                |
| ------- | --------------- | ---------------------------------------------------------------- | ----------------------------------- |
| Snap    | `packages/snap` | The MetaMask Snaps package. Implements secure storage & logic.   | [README](./packages/snap/README.md) |
| Site    | `packages/site` | React application for interacting with the Snap in your browser. | [README](./packages/site/README.md) |

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Fabstir/Fabstir_Media_Player_Snaps.git
cd Fabstir_Media_Player_Snaps

# 2. Install dependencies (monorepo root)
yarn install
```

**Step 3: Apply Particle Network patch**
A known installation bug in `@particle-network` causes a mismatched `viem` import. To fix it on Windows, run the included batch script:

```powershell
.iem-to-particle-fix.bat
```

This updates the `node_modules/@particle-network` package in-place to prevent build failures.

**Step 4: Generate `fabstirdb-lib.tgz`**
The site depends on a local build of `fabstirdb-lib`. To produce and install it:

```bash
# a. Clone and pack the fabstirdb library
git clone https://github.com/Fabstir/fabstirdb.git
cd fabstirdb
npm pack
# This creates a file like fabstirdb-lib-1.2.3.tgz

# b. Move the tarball into the site package
mv fabstirdb-lib-*.tgz ../Fabstir_Media_Player_Snaps/packages/site/fabstirdb-lib.tgz

# c. Return to the monorepo and install it
git checkout -  # go back to the monorepo root
cd Fabstir_Media_Player_Snaps/packages/site
yarn add file:fabstirdb-lib.tgz
```

Once complete, you’re ready to run the web app locally.

### Running Locally

You will need [MetaMask Flask](https://metamask.io/flask/) to load the Snap.

#### 1. Start the Snap

```bash
cd packages/snap
yarn start
```

This serves your Snap at `http://localhost:8080` by default.

#### 2. Start the Web App

```bash
cd packages/site
yarn dev
```

Open your browser at `http://localhost:3000` (or the port shown) to view the media player.

> **Tip:** If you prefer, you can run both with yarn workspaces:
>
> ```bash
>
> ```

yarn workspace @fabstir/media-player-snap start
yarn workspace site dev

```

---

## 🛠️ Development

- **Testing**:  `yarn test`
- **Linting**:  `yarn lint`
- **Auto‑fix lint**:  `yarn lint:fix`
- **Build (Site)**: `cd packages/site && yarn build`

---

## 📦 Releasing & Publishing

This project uses GitHub Actions to automate Snap releases and site deployments. For Snap release guidelines, see the [MetaMask template docs](https://github.com/MetaMask/template-snap-monorepo/blob/main/README.md#releasing--publishing).

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on pull requests, branching strategy, and code standards.

---

## 📖 Learn More

- [MetaMask Snaps Guide](https://docs.metamask.io/guide/snaps.html#serving-a-snap-to-your-local-environment)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

<p align="center">Built with 💜 by Fabstir</p>

```
