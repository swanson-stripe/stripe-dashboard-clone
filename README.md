# Stripe Dashboard Clone

A modern dashboard application inspired by Stripe's UI design, built with React, styled-components, and Chart.js.

## Features

- Clean, modern UI with a white background
- Responsive layout that works across different screen sizes
- Interactive charts for data visualization
- DatePicker component for selecting custom date ranges
- Animated transitions between pages and components
- Fullscreen metric editor with Visual/Code tabs
- Live preview of edited metrics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stripe-dashboard-clone.git
   cd stripe-dashboard-webapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Or use the provided shell script:
   ```
   ./start.sh
   ```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## Usage

- The dashboard displays a series of metrics with trend indicators
- Click on any metric to see its detailed view
- Use the DatePicker to select different date ranges and see how the data changes
- Click the "Edit" button on a metric detail page to open the fullscreen editor
- Toggle between "Visual" and "Code" modes in the editor to see different representations of the metric

## Project Structure

```
stripe-dashboard-webapp/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── styles/          # CSS and styled-components
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Key Components

- **Dashboard**: Main overview page with metrics and charts
- **MetricDetail**: Detailed view of a specific metric
- **MetricEditor**: Fullscreen editor for modifying metrics
- **DatePicker**: Component for selecting date ranges
- **LineChart**: Chart component for data visualization
- **Sidebar**: Navigation component
- **Header**: App header with search and user info

## License

This project is licensed under the MIT License. 