import mermaid from "mermaid";

let mermaidInitialized = false;

export const ensureMermaidInitialized = () => {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
    mermaidInitialized = true;
  }
};

const sanitizeLabel = (label: string) =>
  label
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/"/g, '\\"')
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const wrapWithQuotes = (label: string) => {
  const trimmed = label.trim();
  if (!trimmed) return '""';
  const isQuoted = trimmed.startsWith("\"") && trimmed.endsWith("\"");
  const content = isQuoted ? trimmed.slice(1, -1) : trimmed;
  return `"${sanitizeLabel(content)}"`;
};

export const sanitizeMermaidChart = (chart: string) => {
  if (!chart) return chart;

  const replaceLabeledNode = (input: string, pattern: RegExp, wrapper: (id: string, label: string) => string) =>
    input.replace(pattern, (match, id, label) => wrapper(id, label));

  let sanitized = chart;

  const wrap = (id: string, label: string, open: string, close: string) => {
    const safeLabel = wrapWithQuotes(label);
    return `${id}${open}${safeLabel}${close}`;
  };

  sanitized = replaceLabeledNode(sanitized, /(\b[\w.-]+)\[\[([^\]]*?)\]\]/g, (id, label) =>
    wrap(id, label, "[[", "]]"));

  sanitized = replaceLabeledNode(sanitized, /(\b[\w.-]+)\[(?!\[)([^\]]*?)\]/g, (id, label) =>
    wrap(id, label, "[", "]"));

  return sanitized;
};

export const renderMermaidSvg = async (chart: string) => {
  ensureMermaidInitialized();
  const candidates = [chart];
  const sanitized = sanitizeMermaidChart(chart);
  if (sanitized && sanitized !== chart) {
    candidates.push(sanitized);
  }

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
      const { svg } = await mermaid.render(id, candidate);
      return { svg, chart: candidate };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to render Mermaid diagram");
};

const parseSvgDimensions = (svg: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const svgEl = doc.documentElement;

  const parseDimension = (value: string | null) => {
    if (!value) return NaN;
    const numeric = parseFloat(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : NaN;
  };

  let width = parseDimension(svgEl.getAttribute("width"));
  let height = parseDimension(svgEl.getAttribute("height"));

  if ((!width || !height) && svgEl.hasAttribute("viewBox")) {
    const viewBox = svgEl.getAttribute("viewBox") ?? "";
    const parts = viewBox.split(/\s+/);
    if (parts.length === 4) {
      width = parseFloat(parts[2]);
      height = parseFloat(parts[3]);
    }
  }

  if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
    width = 800;
    height = 600;
  }

  return { width, height };
};

const svgToPngDataUrl = (svg: string, scale = 2) =>
  new Promise<string>((resolve, reject) => {
    try {
      const { width, height } = parseSvgDimensions(svg);
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const image = new Image();
      image.crossOrigin = "anonymous";

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      image.onload = () => {
        try {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL("image/png"));
        } catch (drawError) {
          reject(drawError instanceof Error ? drawError : new Error("Failed to draw SVG on canvas"));
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load SVG for conversion"));
      };

      image.src = objectUrl;
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Failed to convert SVG to PNG"));
    }
  });

export const renderMermaidToPng = async (chart: string) => {
  const { svg, chart: usedChart } = await renderMermaidSvg(chart);
  const pngDataUrl = await svgToPngDataUrl(svg);
  return { svg, pngDataUrl, chart: usedChart };
};

export const convertMermaidMarkdownToImages = async (markdown: string) => {
  const segments: string[] = [];
  let diagrams = 0;
  let content = markdown ?? "";

  // Remove leading ```markdown fence if present
  content = content.replace(/^```markdown\s*\n/i, "");

  const regex = /```mermaid\s*[\r\n]+([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const chart = match[1]?.trim() ?? "";

    segments.push(content.slice(cursor, start));

    if (chart) {
      try {
  const { pngDataUrl } = await renderMermaidToPng(chart);
        let imageMarkup = `![Diagram ${diagrams + 1}](${pngDataUrl})`;

        const preceding = segments[segments.length - 1] ?? "";
        if (preceding && !preceding.endsWith("\n")) {
          imageMarkup = `\n${imageMarkup}`;
        }

        const followingChar = content.charAt(end);
        if (followingChar && followingChar !== "\n") {
          imageMarkup = `${imageMarkup}\n`;
        }

        segments.push(imageMarkup);
        diagrams += 1;
      } catch (error) {
        console.error("Failed to render Mermaid diagram for export:", error);
        segments.push(match[0]);
      }
    } else {
      segments.push(match[0]);
    }

    cursor = end;
  }

  segments.push(content.slice(cursor));

  const processedMarkdown = segments.join("");

  return { markdown: processedMarkdown.trimStart(), diagrams };
};

export const cleanGeneratedText = (text: string) => {
  if (!text) return text;

  let cleaned = text.replace(/^```markdown\s*\n/i, "");

  const paragraphs = cleaned.split(/\n{2,}/).map((paragraph) => paragraph.trimEnd());

  while (paragraphs.length > 0) {
    const first = paragraphs[0]?.trim() ?? "";
    const normalized = first.toLowerCase();
    const shouldDrop =
      normalized.startsWith("of course") ||
      normalized.startsWith("certainly") ||
      normalized.startsWith("absolutely") ||
      normalized.startsWith("sure") ||
      normalized.includes("as a software documentation expert") ||
      normalized.includes("as an ai language model") ||
      normalized.startsWith("this document provides comprehensive documentation");

    if (!shouldDrop) break;
    paragraphs.shift();
  }

  cleaned = paragraphs.join("\n\n");
  return cleaned.trimStart();
};

