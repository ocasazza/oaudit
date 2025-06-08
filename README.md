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

The project provides Nix apps for common development tasks:

```bash
# Start development server
nix run .#dev

# Build for production
nix run .#build

# Preview production build
nix run .#preview

# Run all quality checks (type-check, lint, format-check)
nix run .#check

# Format code with Prettier and fix ESLint issues
nix run .#format
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

1. **Start development server**
   ```bash
   nix run .#dev
   ```

2. **Make your changes** in `src/`

3. **Run quality checks**
   ```bash
   nix run .#check
   ```

4. **Format code**
   ```bash
   nix run .#format
   ```

5. **Build for production**
   ```bash
   nix run .#build
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
- Builds the project with `nix run .#build`
- Deploys to GitHub Pages

### Manual Deployment

```bash
# Build the project
nix run .#build

# The built files will be in the `dist/` directory
# Deploy the contents of `dist/` to your hosting provider
```

## 🔧 Configuration

### Nix Flake

The `flake.nix` defines:
- **Development shell** with all required tools
- **Apps** for common development tasks
- **Reproducible environment** across all machines

### Vite Configuration

- **Port 3000** for development server
- **Port 4173** for preview server
- **Path aliases** (`@/` points to `src/`)
- **Source maps** enabled for production builds

### TypeScript

- **Strict mode** enabled
- **Path mapping** for clean imports
- **Vue 3** support with proper types

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Run quality checks**: `nix run .#check`
5. **Format code**: `nix run .#format`
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
nix run .#dev
```

## 🔗 Useful Links

- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Nix Flakes Documentation](https://nixos.wiki/wiki/Flakes)
