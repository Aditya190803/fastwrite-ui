// ZIP file validation utilities
import JSZip from "jszip";
import { VALID_CODE_EXTENSIONS, API_CONFIG } from "./constants";

export interface ZipValidationResult {
  isValid: boolean;
  totalFiles: number;
  codeFiles: number;
  codeFileNames: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Validates a ZIP file to ensure it contains valid code files
 */
export async function validateZipFile(file: File): Promise<ZipValidationResult> {
  const result: ZipValidationResult = {
    isValid: true,
    totalFiles: 0,
    codeFiles: 0,
    codeFileNames: [],
    errors: [],
    warnings: [],
  };

  // Check file size
  const maxSizeBytes = API_CONFIG.MAX_ZIP_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    result.isValid = false;
    result.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${API_CONFIG.MAX_ZIP_SIZE_MB}MB)`);
    return result;
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith(".zip") && file.type !== "application/zip") {
    result.isValid = false;
    result.errors.push("File must be a ZIP archive");
    return result;
  }

  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);
    
    result.totalFiles = files.filter(f => !zip.files[f].dir).length;

    // Check for valid code files
    for (const filePath of files) {
      const zipEntry = zip.files[filePath];
      
      // Skip directories
      if (zipEntry.dir) continue;

      const fileName = filePath.toLowerCase();
      const isCodeFile = VALID_CODE_EXTENSIONS.some(ext => 
        fileName.endsWith(ext.toLowerCase()) ||
        // Handle extensionless files like Dockerfile, Makefile
        fileName === "dockerfile" ||
        fileName === "makefile" ||
        fileName === "readme" ||
        fileName === ".gitignore" ||
        fileName === ".env" ||
        fileName === ".env.example"
      );

      if (isCodeFile) {
        result.codeFiles++;
        result.codeFileNames.push(filePath);
      }
    }

    // Validate results
    if (result.totalFiles === 0) {
      result.isValid = false;
      result.errors.push("ZIP file is empty");
      return result;
    }

    if (result.codeFiles === 0) {
      result.isValid = false;
      result.errors.push("ZIP file does not contain any recognizable code files");
      result.errors.push(`Supported extensions: ${VALID_CODE_EXTENSIONS.slice(0, 10).join(", ")}...`);
      return result;
    }

    // Warnings
    const codeRatio = result.codeFiles / result.totalFiles;
    if (codeRatio < 0.3 && result.totalFiles > 10) {
      result.warnings.push(`Only ${Math.round(codeRatio * 100)}% of files are code files. Consider removing unnecessary files for better results.`);
    }

    // Check for common directories that should be excluded
    const hasNodeModules = files.some(f => f.includes("node_modules/"));
    const hasDist = files.some(f => f.startsWith("dist/") || f.includes("/dist/"));
    const hasBuild = files.some(f => f.startsWith("build/") || f.includes("/build/"));
    const hasVenv = files.some(f => f.includes("venv/") || f.includes(".venv/"));

    if (hasNodeModules) {
      result.warnings.push("ZIP contains node_modules/ - consider excluding for better performance");
    }
    if (hasDist) {
      result.warnings.push("ZIP contains dist/ directory - consider excluding build artifacts");
    }
    if (hasBuild) {
      result.warnings.push("ZIP contains build/ directory - consider excluding build artifacts");
    }
    if (hasVenv) {
      result.warnings.push("ZIP contains Python virtual environment - consider excluding");
    }

    // Check for very large number of files
    if (result.codeFiles > 1000) {
      result.warnings.push(`Large project (${result.codeFiles} code files) - generation may take longer`);
    }

  } catch (error) {
    result.isValid = false;
    if (error instanceof Error) {
      result.errors.push(`Failed to parse ZIP file: ${error.message}`);
    } else {
      result.errors.push("Failed to parse ZIP file: Unknown error");
    }
  }

  return result;
}

/**
 * Gets a preview of the files in a ZIP
 */
export async function getZipFilePreview(file: File, maxFiles = 20): Promise<string[]> {
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files)
      .filter(f => !zip.files[f].dir)
      .slice(0, maxFiles);
    return files;
  } catch {
    return [];
  }
}
