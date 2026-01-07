# FastWrite UI

<p align="center">
  <strong>AI-Powered Software Documentation Generator</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

FastWrite UI is a modern React application that simplifies the creation of comprehensive documentation for software projects. It leverages AI language models to analyze code repositories and produce various documentation formats, from code-level comments to academic reports.

## Features

### Core Features
- **Multiple Source Options**: Upload code via GitHub URL or ZIP file
- **Private Repository Support**: Use GitHub tokens for private repos
- **Branch/Tag Selection**: Specify which branch or tag to document

### Documentation Types
- **Code Documentation**:
  - Inline code comments
  - Function/method documentation
  - Class and module overviews
  - API endpoint documentation
  - Error handling documentation
  - Performance considerations
  - Security considerations
  - Testing documentation
  - Deployment documentation
- **Academic Reports**:
  - Abstract
  - Introduction
  - Literature review
  - Methodology
  - Implementation details
  - Results & testing
  - Conclusion
  - Future scope

### AI Integration
- **Multi-Provider Support**: OpenAI, Gemini, Groq, OpenRouter
- **Customizable Prompts**: Control what gets generated
- **Diagram Generation**: Mermaid.js visualizations

### User Experience
- 🌙 **Dark Mode**: Full dark theme support
- 📊 **Progress Tracking**: Real-time generation progress
- 📋 **Copy to Clipboard**: One-click code copying
- 📑 **Table of Contents**: Easy navigation for long docs
- ✏️ **Inline Editing**: Edit generated documentation
- 📚 **History**: Access previous generations
- 💾 **Templates**: Save and reuse configurations
- 📤 **Multiple Exports**: PDF, Markdown, HTML

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) v1.0+ (recommended) or Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/aditya190803/fastwrite-ui.git
cd fastwrite-ui

# Install dependencies
bun install

# Copy environment configuration
cp .env.example .env

# Start development server
bun run dev
```

The app will be available at `http://localhost:5173`

### Using Docker

```bash
# Development
docker-compose up

# Production build
docker build -t fastwrite-ui .
docker run -p 80:80 fastwrite-ui
```

## Usage

### Step 1: Choose Source
1. **GitHub URL**: Paste a public GitHub repository URL
   - For private repos, add your GitHub token
   - Optionally specify a branch or tag
2. **ZIP Upload**: Upload a ZIP file containing your code

### Step 2: Configure Documentation
1. Select documentation type (Code or Report)
2. Choose which sections to include
3. Configure AI provider and model
4. Add project description for context

### Step 3: Generate
1. Click "Generate Documentation"
2. Watch real-time progress
3. View, edit, and export results

### Step 4: Export
Choose your preferred format:
- **PDF**: Formatted document
- **Markdown**: Raw `.md` file
- **HTML**: Styled web page

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_URL=https://fastwrite-api.onrender.com
VITE_API_TIMEOUT=300000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=false
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://fastwrite-api.onrender.com` |
| `VITE_API_TIMEOUT` | Request timeout in ms | `300000` (5 min) |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |

### API Keys

API keys are stored securely in your browser's localStorage. Supported providers:

| Provider | Get API Key |
|----------|-------------|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Groq | [console.groq.com](https://console.groq.com/keys) |
| OpenRouter | [openrouter.ai](https://openrouter.ai/keys) |

## Scripts

```bash
# Development
bun run dev           # Start dev server
bun run build         # Production build
bun run preview       # Preview production build

# Testing
bun run test          # Run tests in watch mode
bun run test:run      # Run tests once
bun run test:coverage # Run with coverage

# Code Quality
bun run lint          # Run ESLint
```

## Troubleshooting

### Common Issues

#### "API request timed out"
- Large repositories may take longer to process
- Increase timeout: set `VITE_API_TIMEOUT=600000` (10 min)
- Try with fewer sections selected

#### "Failed to fetch repository"
- Ensure the GitHub URL is correct
- For private repos, add a GitHub token with `repo` scope
- Check if the repository is accessible

#### "Invalid API key"
- Verify your API key is correct
- Check the API key has sufficient credits/quota
- Try generating a new API key

#### Diagrams not rendering
- Mermaid diagrams may have syntax errors from AI
- The app automatically attempts to repair broken diagrams
- Try regenerating the documentation

#### Dark mode not working
- Clear localStorage and refresh
- Check browser extensions that might override styles

### Performance Tips

1. **Select fewer sections** for faster generation
2. **Use smaller repositories** when testing
3. **Choose faster models** (GPT-3.5-turbo, Gemini Flash)
4. **Close other browser tabs** for heavy documentation

### Getting Help

- Check [existing issues](https://github.com/aditya190803/fastwrite-ui/issues)
- Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
- Open a new issue with reproduction steps

## Technologies

- **Frontend**: React 18, TypeScript 5.5
- **Styling**: Tailwind CSS, shadcn/ui
- **Build**: Vite 5, Bun
- **Testing**: Vitest, React Testing Library
- **Markdown**: react-markdown, remark-gfm
- **Diagrams**: Mermaid.js
- **Exports**: jsPDF, html2canvas

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with ❤️ by the FastWrite team
</p>
