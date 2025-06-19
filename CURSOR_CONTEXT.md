# Cursor AI Development Context - Stripe Dashboard Clone

This document provides deep technical context for Cursor AI and developers to understand the codebase architecture, patterns, and development guidelines.

## ��️ Project Architecture Overview

A sophisticated React dashboard application (~50+ components, 15,000+ lines) with advanced features:

- **Interactive SQL Editor** with AI prompt processing
- **Dual-mode interface** (Visual spreadsheet + Code editor)
- **Real-time data visualization** with Chart.js
- **Theme system** (Light/Dark mode)
- **Advanced state management** without external libraries

## 🎯 Core Component Analysis

### 1. MetricEditor.js - The Crown Jewel
**Location**: `src/pages/MetricEditor.js` (~6,700 lines)
**Complexity Level**: Very High
**Purpose**: Advanced metric creation and editing interface

#### **Key Features:**
```javascript
// Dual interface modes
const [editorMode, setEditorMode] = useState("visual"); // "visual" | "code"

// Advanced processing pipeline
const [animationStage, setAnimationStage] = useState("");
// Stages: "chatBubble" → "moved" → "reconstructing" → "updating"

// Excel-like data manipulation
const [selectedCells, setSelectedCells] = useState(new Set());
const [selectedColumns, setSelectedColumns] = useState(new Set());
```
```
#### **Recent Enhancement: Chat Bubble Treatment (Latest)**
**Purpose**: Improve UX for AI prompt processing in MetricEditor

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

### 📈 Development Metrics
- **Total Commits**: 20+ in recent history
- **Active Branches**: 15+ branches
- **Bundle Size**: 454KB gzipped
- **Last Updated**: December 2024
