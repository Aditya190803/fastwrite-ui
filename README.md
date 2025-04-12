# FastWrite UI

A modern web interface for automated software documentation generation.

## Project Overview

FastWrite UI is a React-based application that simplifies the creation of comprehensive documentation for software projects. It leverages AI language models to analyze code repositories and produce various documentation formats, from code-level comments to academic reports.

## Features

- **Multiple Source Options**: Upload code via GitHub URL or ZIP file
- **Customizable Documentation Types**:
  - Code documentation (inline comments, function summaries, class overviews)
  - Academic reports (abstract, introduction, methodology, etc.)
- **AI Provider Integration**: Compatible with multiple LLM providers (OpenAI, Gemini, Groq, OpenRouter)
- **Visualizations**: Generate code structure diagrams with Mermaid.js format
- **Literature References**: Automatic or manual citation options

## Technologies

This project is built with:
- React
- TypeScript
- Tailwind CSS
- Vite

## Getting Started

### Development Setup

```sh
# Step 1: Clone the repository
git clone https://github.com/yourusername/fastwrite-ui.git

# Step 2: Navigate to the project directory
cd fastwrite-ui

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev