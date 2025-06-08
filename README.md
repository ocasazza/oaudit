# Oudit

A modern Vue.js + TypeScript application with Nix flake for reproducible development environments and automated GitHub Pages deployment.

## 🚀 Features

- **Vue 3** with Composition API and TypeScript
- **Nix Flake** for reproducible development environments
- **Tailwind CSS** with custom theme configuration
- **ESLint + Prettier** for code quality
- **Vite** for fast development and optimized builds
- **GitHub Actions** for automated deployment
- **direnv** for automatic environment loading

## 📋 Prerequisites

- [Nix](https://nixos.org/download.html) with flakes enabled
- [direnv](https://direnv.net/docs/installation.html)

### Enable Nix Flakes

Add to your `~/.config/nix/nix.conf` (create if it doesn't exist):

```
experimental-features = nix-command flakes
```

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd oudit
   ```

2. **Allow direnv**
   ```bash
   direnv allow
   ```

   This will automatically load the Nix development environment.

3. **Install dependencies** (handled by Nix)

   The flake will automatically provide all necessary tools including Node.js, npm, TypeScript, Vue CLI, and development tools.

## 🎯 Development

### Available Commands

Use `nix develop -c` to run commands in the Nix development environment:

```bash
# Install npm dependencies
nix develop -c npm install

# Start development server
nix develop -c npm run dev

# Build for production
nix develop -c npm run build

# Preview production build
nix develop -c npm run preview

# Run all quality checks
nix develop -c npm run lint
nix develop -c npm run format:check

# Format code with Prettier and fix ESLint issues
nix develop -c npm run format
nix develop -c npm run lint:fix
```

### Alternative: Direct Tool Access

You can also use tools directly within the Nix environment:

```bash
# Start development server with custom options
nix develop -c vite dev --port 3001 --host 0.0.0.0

# Run specific checks
nix develop -c vue-tsc --noEmit
nix develop -c eslint src --ext .vue,.ts,.js
nix develop -c prettier --check src
```

### Development Workflow

1. **Install dependencies**
   ```bash
   nix develop -c npm install
   ```

2. **Start development server**
   ```bash
   nix develop -c npm run dev
   ```

3. **Make your changes** in `src/`

4. **Run quality checks**
   ```bash
   nix develop -c npm run lint
   nix develop -c npm run format:check
   ```

5. **Format code**
   ```bash
   nix develop -c npm run format
   ```

6. **Build for production**
   ```bash
   nix develop -c npm run build
   ```

## 🏗️ Project Structure

```
oudit/
├── flake.nix              # Nix flake configuration
├── flake.lock             # Lock file for reproducible builds
├── .envrc                 # direnv configuration
├── package.json           # Project metadata
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .gitignore             # Git ignore patterns
├── .github/workflows/     # GitHub Actions
│   └── deploy.yml         # Deployment workflow
├── public/                # Static assets
│   └── index.html         # HTML template
└── src/                   # Source code
    ├── main.ts            # Application entry point
    ├── App.vue            # Root component
    ├── style.css          # Global styles
    └── components/        # Vue components
        └── FeatureCard.vue
```

## 🎨 Styling

The project uses Tailwind CSS with a custom theme:

- **Primary colors**: Blue palette (`primary-50` to `primary-950`)
- **Secondary colors**: Slate palette (`secondary-50` to `secondary-950`)
- **Font**: Inter from Google Fonts

### Custom CSS Classes

```css
/* Buttons */
.btn, .btn-primary, .btn-secondary

/* Cards */
.card

/* Utilities */
.text-balance
```

## 🚀 Deployment

### GitHub Pages (Automatic)

The project is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to "GitHub Actions"
3. **Push to main branch** - deployment happens automatically

The GitHub Actions workflow:
- Uses Nix for reproducible builds
- Installs npm dependencies with `nix develop -c npm install`
- Builds the project with `nix develop -c npm run build` (with production base path)
- Includes `.nojekyll` file to prevent Jekyll processing
- Deploys to GitHub Pages

### Manual Deployment

```bash
# Build the project
nix develop -c npm run build

# The built files will be in the `dist/` directory
# Deploy the contents of `dist/` to your hosting provider
```

## 🔧 Configuration

### Nix Flake

The `flake.nix` defines:
- **Development shell** with all required tools (Node.js, npm, TypeScript, ESLint, Prettier)
- **Reproducible environment** across all machines
- **Consistent tooling** via `nix develop -c` commands

### Vite Configuration

- **Port 3000** for development server
- **Port 4173** for preview server
- **Path aliases** (`@/` points to `src/`)
- **Source maps** enabled for production builds
- **Base path** automatically configured:
  - Development: `/` (root)
  - Production: `/oudit/` (GitHub Pages)
  - Override with `VITE_BASE_PATH` environment variable

### TypeScript

- **Strict mode** enabled
- **Path mapping** for clean imports
- **Vue 3** support with proper types

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Run quality checks**: `nix develop -c npm run lint`
5. **Format code**: `nix develop -c npm run format`
6. **Submit a pull request**

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Nix Issues

```bash
# Rebuild the flake
nix flake update

# Clear Nix cache
nix-collect-garbage -d
```

### direnv Issues

```bash
# Reload direnv
direnv reload

# Check direnv status
direnv status
```

### Development Server Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
nix develop -c npm run dev
```

## 🔗 Useful Links

- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Nix Flakes Documentation](https://nixos.wiki/wiki/Flakes)
