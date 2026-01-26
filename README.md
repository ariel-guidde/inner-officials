# inner-officials

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