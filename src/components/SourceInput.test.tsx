import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SourceInput } from "@/components/SourceInput";

describe("SourceInput", () => {
  const defaultProps = {
    sourceType: "github" as const,
    setSourceType: vi.fn(),
    githubUrl: "",
    setGithubUrl: vi.fn(),
    zipFile: null,
    setZipFile: vi.fn(),
    selectedAiProvider: "openai" as const,
    setSelectedAiProvider: vi.fn(),
    selectedAiModel: "gpt-4o",
    setSelectedAiModel: vi.fn(),
    projectDescription: "",
    setProjectDescription: vi.fn(),
  };

  it("renders GitHub input by default", () => {
    render(<SourceInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/https:\/\/github\.com\/user\/repo/i)).toBeInTheDocument();
  });

  it("switches to ZIP upload when tab is clicked", () => {
    render(<SourceInput {...defaultProps} />);
    const zipTab = screen.getByText(/BINARY_ZIP/i);
    fireEvent.click(zipTab);
    expect(defaultProps.setSourceType).toHaveBeenCalledWith("zip");
  });

  it("calls setGithubUrl on input change", () => {
    render(<SourceInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/user\/repo/i);
    fireEvent.change(input, { target: { value: "https://github.com/user/repo" } });
    expect(defaultProps.setGithubUrl).toHaveBeenCalledWith("https://github.com/user/repo");
  });
});
