# Development Workflow

## 🌿 Branch Structure

- **`main`** - Production branch (deployed to https://swanson-stripe.github.io/stripe-dashboard-clone/)
- **`development`** - Development branch (deployed to https://swanson-stripe.github.io/stripe-dashboard-clone/dev/)

## 🤖 Automated Deployments

### GitHub Actions Workflows

1. **Production Deployment** (`.github/workflows/deploy-main.yml`)
   - Triggers on push to `main` branch
   - Deploys to production URL automatically

2. **Development Preview** (`.github/workflows/deploy-dev.yml`)
   - Triggers on push to `development` branch
   - Triggers on pull requests to `main` branch
   - Deploys to development preview URL
   - Adds preview link comments to pull requests

## 🔄 Development Process

### 1. Switch to Development Branch
```bash
git checkout development
```

### 2. Make Changes
```bash
# Make your changes to the code
git add .
git commit -m "Feature: your description"
git push origin development
```

### 3. Automatic Preview Deployment
- GitHub Actions will automatically build and deploy your changes
- Preview will be available at: `https://swanson-stripe.github.io/stripe-dashboard-clone/dev/`
- No manual deployment needed!

### 4. Create Pull Request (Optional)
```bash
# Create a pull request from development to main
# GitHub will automatically add a preview link comment
```

### 5. When Ready for Production
```bash
# Switch to main branch
git checkout main

# Merge development changes
git merge development

# Push to main (triggers automatic production deployment)
git push origin main
```

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Manual deploy main branch to production
- `npm run deploy-dev` - Manual deploy development branch to preview
- `npm run deploy-preview` - Manual deploy current branch to preview

## 🌐 URLs

- **Production**: https://swanson-stripe.github.io/stripe-dashboard-clone/
- **Development Preview**: https://swanson-stripe.github.io/stripe-dashboard-clone/dev/

## 🛡️ Best Practices

1. Always work on the `development` branch
2. GitHub Actions will automatically deploy previews - no manual deployment needed
3. Only merge to main when features are complete and tested
4. Use descriptive commit messages
5. Create pull requests to get automatic preview links
6. Production deploys automatically when you push to main

## 🔧 Manual Deployment (Fallback)

If GitHub Actions fail, you can still deploy manually:

```bash
# For development preview
npm run deploy-dev

# For production (from main branch)
npm run deploy
``` 