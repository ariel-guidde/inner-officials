# Inner Officials

A card-based debate game set in the imperial court of ancient China, built with React and TypeScript.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

### Build

```bash
npm run build
```

### Tests & Benchmarks

```bash
npm run test        # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run bench       # Run performance benchmarks
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed overview of the game systems, combat engine pipeline, and code organization.

## Deployment

This project is deployed on Vercel. The game is accessible at: `https://inner-officials.vercel.app` (or your custom domain if configured).

### First-Time Setup

1. Create a free Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository (`ariel-guidde/inner-officials`)
3. Vercel will auto-detect Vite settings and deploy automatically
4. (Optional) Install Vercel CLI globally: `npm i -g vercel`

### Deployment Methods

#### Automatic Deployment (Recommended)
- Push changes to the `main` branch on GitHub
- Vercel will automatically build and deploy the latest version

#### Manual Deployment
- Run `npm run deploy` to deploy via Vercel CLI
- Requires Vercel CLI to be installed and authenticated (`vercel login`)
