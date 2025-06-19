# Cursor AI Development Context - Stripe Dashboard Clone

This document provides deep technical context for Cursor AI and developers to understand the codebase architecture, patterns, and development guidelines.

## ��️ Project Architecture Overview

A sophisticated React dashboard application (~50+ components, 15,000+ lines) with advanced features:

- **Interactive SQL Editor** with AI prompt processing
- **Dual-mode interface** (Visual spreadsheet + Code editor)
- **Real-time data visualization** with Chart.js
- **Theme system** (Light/Dark mode)
- **Advanced state management** without external libraries

## 🔥 Key Features

### Dual Interface Modes
```javascript
// Dual interface modes
const [editorMode, setEditorMode] = useState("visual"); // "visual" | "code"
```

### Advanced Processing Pipeline
```javascript
// Advanced processing pipeline
const [animationStage, setAnimationStage] = useState("");
// Stages: "chatBubble" → "moved" → "reconstructing" → "updating"
```

### Excel-like Data Manipulation
```javascript
// Excel-like data manipulation
const [selectedCells, setSelectedCells] = useState(new Set());
const [selectedColumns, setSelectedColumns] = useState(new Set());
```

## ⭐ Recent Enhancement: Chat Bubble Treatment (Latest)

**Purpose**: Improve UX for AI prompt processing in MetricEditor

## 🎯 Core Component Analysis

### 1. MetricEditor.js - The Crown Jewel
**Location**: `src/pages/MetricEditor.js` (~6,700 lines)
**Complexity Level**: Very High
**Purpose**: Advanced metric creation and editing interface

## Development Guidelines
Follow existing patterns for theme compatibility and state management.

**Live URL**: https://swanson-stripe.github.io/stripe-dashboard-clone/

## 📊 Project History & Branch Management
### 🌳 Branch Structure
- **main** - Primary development branch, deployed to production
- **development** - Main development branch for new features
- **enhanced-analytics** - Analytics enhancements and UI improvements

### 📝 Recent Commit History
a4f3357 - Add CURSOR_CONTEXT.md - comprehensive technical documentation
d9252c8 - Add chat bubble treatment for prompt submissions
bd17583 - Fix MetricEditor compilation errors and add missing functionality

### 🖥️ Application Surfaces & Pages

#### **1. Dashboard (Home Page)**
- **URL**: `/` 
- **Page Title**: "Dashboard"
- **Structure**: Main dashboard with today's metrics and overview sections
- **Functionality**: 
  - Real-time metric cards with trend indicators
  - Interactive line charts with Chart.js integration
  - Dual-column layout: main chart + smaller metric cards
  - Metric selection dropdown with filtering
  - Period controls (Today, 7d, 30d, etc.)
  - Click-through navigation to detailed views
- **Key Features**: Volume tracking, revenue metrics, transaction counts

#### **2. Analytics (Data Studio)**
- **URL**: `/data-studio`
- **Page Title**: "Analytics" 
- **Structure**: Report management interface with trending metrics
- **Functionality**:
  - "New" button to create reports → navigates to MetricEditor
  - Trending metrics grid (4-column layout)
  - Expandable sections: "Pinned reports", "All reports"
  - Report filtering by creator, date, status
  - Pagination controls for large report lists
  - Pin/unpin functionality for favorite reports
- **Key Features**: Report discovery, sparkline previews, collaborative filtering

#### **3. Metric Editor (Analytics Builder)**
- **URL**: `/data-studio/:reportId/edit` or `/metrics/:metricId/edit`
- **Page Title**: "Metric Editor" / "Create New Metric"
- **Structure**: Sophisticated dual-mode editor interface
- **Functionality**:
  - **Visual Mode**: Excel-like spreadsheet interface
    - Schema browser with Stripe data model
    - Drag-and-drop column management
    - "Included" and "Pinned" column sections
    - Cell selection and multi-column operations
  - **Code Mode**: SQL editor with syntax highlighting
    - Line-numbered code editor
    - Real-time syntax highlighting
    - Prompt input for AI-assisted SQL generation
    - **NEW: Chat bubble treatment** - shows user prompt before processing
  - **Processing Pipeline**: Multi-stage animation system
    - Chat bubble display (2s)
    - SQL fragment generation with highlighting
    - Line-by-line editor updates
- **Key Features**: Dual interface, AI prompts, real-time collaboration

#### **4. Metric Detail View**
- **URL**: `/metrics/:metricId` or `/metric/:metricId`
- **Page Title**: Individual metric name
- **Structure**: Detailed metric analysis page
- **Functionality**:
  - Large primary chart with metric visualization
  - Breadcrumb navigation back to source
  - Edit button → navigates to MetricEditor
  - Metric metadata and configuration display
  - Historical data trends and analysis
- **Key Features**: Deep metric analysis, edit access, navigation context

#### **5. Report Detail View** 
- **URL**: `/data-studio/:reportId`
- **Page Title**: Individual report name
- **Structure**: Comprehensive report viewing interface
- **Functionality**:
  - Multi-chart dashboard layout
  - Chart configuration panels
  - Export and sharing options
  - Edit button → navigates to MetricEditor
  - Breadcrumb navigation to Analytics
- **Key Features**: Report visualization, chart management, collaborative viewing

#### **6. Billing Overview**
- **URL**: `/billing/overview`
- **Page Title**: "Billing Overview"
- **Structure**: Billing-focused dashboard with revenue metrics
- **Functionality**:
  - Revenue composition charts
  - Subscription metrics tracking
  - Usage-based billing insights
  - Forecasting toggles and settings
  - Multi-tab interface (Overview, Details, etc.)
  - Period and interval controls
- **Key Features**: Revenue analysis, subscription tracking, forecasting

#### **7. User Detail**
- **URL**: `/users/:userId/:reportId`
- **Page Title**: User-specific report view
- **Structure**: User-centric report interface
- **Functionality**:
  - User context for report viewing
  - Breadcrumb navigation through user → report hierarchy
  - Personalized metric views
- **Key Features**: User-specific analytics, contextual navigation

#### **8. Empty/Placeholder Pages**
- **URLs**: Various (`/balances`, `/transactions`, `/customers`, etc.)
- **Page Titles**: Feature-specific (e.g., "Balances", "Transactions")
- **Structure**: Consistent placeholder layout
- **Functionality**:
  - Branded placeholder content
  - "Coming Soon" messaging
  - Consistent navigation structure
- **Key Features**: Future feature placeholders, consistent UX

### 🎨 Cross-Surface Design Patterns

#### **Navigation Consistency**
- Unified sidebar navigation across all surfaces
- Breadcrumb navigation for hierarchical pages
- Consistent "Edit" button placement → MetricEditor

#### **Theme Integration**
- Light/Dark mode support across all surfaces
- Consistent color palette (Stripe purple, grays)
- Responsive design patterns

#### **Interactive Elements**
- Hover states and micro-animations
- Loading states and processing feedback
- Consistent button styling and placement

#### **Data Flow**
- Mock data integration across all surfaces
- Consistent metric formatting and display
- Unified Chart.js integration patterns
