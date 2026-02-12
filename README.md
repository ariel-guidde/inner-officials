# Inner Officials (内官) 🏛️

A strategic card-based debate game set in Tang Dynasty imperial China. Use wuxing (五行) philosophy and rhetorical mastery to win favor with the judge.

## 🎮 Game Overview

Players engage in verbal duels within the imperial court, playing argument cards based on the five elements (Wood, Fire, Earth, Metal, Water) to gain standing with judges while managing their face (reputation) and the judge's patience.

### Core Mechanics
- **Wuxing System**: Element harmony affects card effectiveness
- **Standing & Tiers**: Build favor with judges to advance through tiers
- **Face & Composure**: Manage reputation and withstand verbal attacks
- **Patience Management**: Judge's patience depletes each turn
- **Opponent Intentions**: Predict and counter opponent strategies

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

### Build & Test
```bash
npm run build       # Production build
npm run test        # Run unit tests
npm run test:watch  # Watch mode
npm run bench       # Performance benchmarks
```

## 🏗️ Architecture

### Technology Stack
- **React 18** + **TypeScript** - Type-safe component architecture
- **Vite** - Fast build tooling
- **Framer Motion** - Animation system
- **Tailwind CSS** - Utility-first styling

### Project Structure
```
src/
├── components/          # React components (View Layer)
│   ├── effects/        # Animation components
│   ├── game/           # Battle UI
│   ├── menu/           # Main menu, settings
│   └── campaign/       # Campaign mode
│
├── hooks/              # React hooks (Controller Layer)
│   ├── useGameLogic.ts      # Main battle logic
│   ├── useBattleEffects.ts  # Animation system
│   └── useSession.ts        # Campaign management
│
├── lib/                # Core systems (Model Layer)
│   ├── combat/         # Combat engine
│   └── animations/     # Animation constants
│
├── types/              # TypeScript definitions
└── data/               # Game content (Data Layer)
    ├── cards.ts        # Card definitions
    ├── opponents.ts    # Opponent templates
    └── judges.ts       # Judge configs
```

## 📚 Documentation

- **[ANIMATIONS.md](./ANIMATIONS.md)** - Complete animation system guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Deep dive into game systems

## 🎨 Key Systems

### Animation System
Event-driven, non-blocking visual feedback for all game actions.

**Features:**
- Element particle systems (30 particles per card)
- Opponent intention animations (2s, type-specific)
- Judge decree scrolls (3s, Tang Dynasty style)
- Status effect indicators (1.5s, auto-positioned)
- Tier advancement celebrations (3.5s, fireworks & confetti)

See **[ANIMATIONS.md](./ANIMATIONS.md)** for detailed documentation.

### Combat Engine
Immutable state management with functional updates. Located in `src/lib/combat/`.

**Key concepts:**
- Data-driven effect system
- Template-based status effects
- Wuxing (五行) element interactions
- Multi-opponent support

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for system details.

## 🎯 Development Guidelines

### Code Style
- **Immutable updates** - Always use spread operators for state
- **Pure functions** - Prefer pure functions over classes
- **Type safety** - Leverage TypeScript's type system

### Naming Conventions
- Components: `PascalCase` (`BattleArena.tsx`)
- Hooks: `camelCase` with `use` prefix (`useBattleEffects.ts`)
- Constants: `SCREAMING_SNAKE_CASE` (`ELEMENT_FIRE`)
- Functions: `camelCase` (`processTurn`)

### Performance
- ✅ Use `transform` and `opacity` for animations (GPU)
- ✅ Memoize expensive computations with `useMemo`
- ✅ Use `useCallback` for event handlers
- ❌ Never animate layout properties (`width`, `height`)

## 🐛 Debugging

```typescript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Animation debugging
localStorage.setItem('debug-animations', 'true');
```

## 🚢 Deployment

Deployed on Vercel at: `https://inner-officials.vercel.app`

### Automatic Deployment (Recommended)
Push to `main` branch → Vercel auto-deploys

### Manual Deployment
```bash
npm run deploy  # Requires: npm i -g vercel && vercel login
```

### First-Time Setup
1. Create Vercel account at [vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Vercel auto-detects Vite and deploys

## 🤝 Contributing

### Pull Request Process
1. Create feature branch from `main`
2. Follow code style guidelines
3. Add tests for new features
4. Update documentation
5. Ensure `npm run build` passes
6. Submit PR with clear description

### Commit Messages
```
feat: Add new card type for Earth element
fix: Correct patience cost calculation
refactor: Simplify effect resolver
docs: Update animation documentation
```

## 📄 License

Copyright © 2026 Ariel Kolikant

---

**Built with ❤️ and traditional Chinese philosophy**
