# Stripe Dashboard Clone

A modern dashboard application inspired by Stripe's UI design, built with React, styled-components, and Chart.js.

## 🌐 Live Demo

- **Production**: https://swanson-stripe.github.io/stripe-dashboard-clone/
- **Development Preview**: https://swanson-stripe.github.io/stripe-dashboard-clone/dev/

## Features

- Clean, modern UI with a white background
- Responsive layout that works across different screen sizes
- Interactive charts for data visualization
- DatePicker component for selecting custom date ranges
- Animated transitions between pages and components
- Fullscreen metric editor with Visual/Code tabs
- Live preview of edited metrics
- Plan filtering functionality for overage revenue metrics

## 🚀 Development Workflow

This project uses a standard GitHub branching workflow with automated deployments:

- **`main`** branch → Production deployment (automatic)
- **`development`** branch → Preview deployment (automatic)
- Pull requests → Automatic preview links in comments

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed workflow instructions.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swanson-stripe/stripe-dashboard-clone.git
   cd fresh-stripe-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Manual deploy to production
- `npm run deploy-dev` - Manual deploy to development preview
- `npm test` - Run tests

## Usage

- The dashboard displays a series of metrics with trend indicators
- Click on any metric to see its detailed view
- Use the DatePicker to select different date ranges and see how the data changes
- Click the "Edit" button on a metric detail page to open the fullscreen editor
- Toggle between "Visual" and "Code" modes in the editor to see different representations of the metric
- Use plan filters to see how metrics change based on different subscription plans

## Project Structure

```
fresh-stripe-dashboard/
├── .github/workflows/   # GitHub Actions for automated deployment
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── data/            # Mock data and configurations
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── package.json         # Dependencies and scripts
├── DEVELOPMENT.md       # Development workflow guide
└── README.md            # Project documentation
```

## Key Components

- **Dashboard**: Main overview page with metrics and charts
- **MetricDetail**: Detailed view of a specific metric with plan filtering
- **MetricEditor**: Fullscreen editor for modifying metrics
- **BillingOverview**: Billing summary and usage tracking
- **MetricsContext**: Centralized state management for metrics and plan filtering
- **PlanFilter**: Component for filtering metrics by subscription plan
- **DatePicker**: Component for selecting date ranges
- **LineChart**: Chart component for data visualization
- **Sidebar**: Navigation component
- **Header**: App header with search and user info

## 🤝 Contributing

1. Create a feature branch from `development`
2. Make your changes
3. Push to your branch (automatic preview deployment)
4. Create a pull request to `main`
5. Review the automatic preview link in the PR comments
6. Merge when ready (automatic production deployment)

## License

This project is licensed under the MIT License. 