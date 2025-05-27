# Development Workflow

## 🌿 Branch Structure

- **`main`** - Production branch (deployed to https://swanson-stripe.github.io/stripe-dashboard-clone/)
- **`development`** - Development branch (deployed to https://swanson-stripe.github.io/stripe-dashboard-clone/dev/)

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

### 3. Deploy to Development Preview
```bash
npm run deploy-dev
```
This deploys to: `https://swanson-stripe.github.io/stripe-dashboard-clone/dev/`

### 4. When Ready for Production
```bash
# Switch to main branch
git checkout main

# Merge development changes
git merge development

# Push to main
git push origin main

# Deploy to production
npm run deploy
```

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy main branch to production
- `npm run deploy-dev` - Deploy development branch to preview
- `npm run deploy-preview` - Deploy current branch to preview

## 🌐 URLs

- **Production**: https://swanson-stripe.github.io/stripe-dashboard-clone/
- **Development Preview**: https://swanson-stripe.github.io/stripe-dashboard-clone/dev/

## 🛡️ Best Practices

1. Always work on the `development` branch
2. Test changes using `npm run deploy-dev` before merging to main
3. Only merge to main when features are complete and tested
4. Use descriptive commit messages
5. Deploy to production only from the main branch 