import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocumentationPreferences } from "@/components/DocumentationPreferences";
import { Tabs } from "@/components/ui/tabs";

// Mock manualArxivSearch
vi.mock("@/lib/arxiv", () => ({
  manualArxivSearch: vi.fn(() => Promise.resolve({ papers: [], query: "", totalResults: 0 })),
  CODE_SECTIONS: [
    { id: "overview", label: "Overview", description: "Project overview" },
  ],
  REPORT_SECTIONS: [
    { id: "literature_survey", label: "Literature Survey", description: "Search for related papers" },
  ],
}));

describe("DocumentationPreferences", () => {
  const defaultProps = {
    selectedCodeSections: [],
    setSelectedCodeSections: vi.fn(),
    selectedReportSections: [],
    setSelectedReportSections: vi.fn(),
    literatureSource: "auto" as const,
    setLiteratureSource: vi.fn(),
    manualReferences: "",
    setManualReferences: vi.fn(),
  };

  it("renders code sections tabs by default", () => {
    render(
      <Tabs defaultValue="code">
        <DocumentationPreferences {...defaultProps} />
      </Tabs>
    );
    expect(screen.getByText(/OVERVIEW/i)).toBeInTheDocument();
  });

  it("calls setSelectedCodeSections when a code section is toggled", () => {
    render(
      <Tabs defaultValue="code">
        <DocumentationPreferences {...defaultProps} />
      </Tabs>
    );
    const checkbox = screen.getByLabelText(/OVERVIEW/i);
    fireEvent.click(checkbox);
    expect(defaultProps.setSelectedCodeSections).toHaveBeenCalled();
  });

  it("shows literature survey options when report section is enabled", () => {
    const props = {
      ...defaultProps,
      selectedReportSections: ["literature_survey"],
    };
    render(
      <Tabs defaultValue="report">
        <DocumentationPreferences {...props} />
      </Tabs>
    );
    expect(screen.getByText(/AUTO \(ARXIV\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MANUAL/i)).toBeInTheDocument();
  });

  it("shows search input when manual literature source is selected", () => {
    const props = {
      ...defaultProps,
      selectedReportSections: ["literature_survey"],
      literatureSource: "manual" as const,
    };
    render(
      <Tabs defaultValue="report">
        <DocumentationPreferences {...props} />
      </Tabs>
    );
    expect(screen.getByPlaceholderText(/SEARCH BY TOPIC, TITLE, OR AUTHOR/i)).toBeInTheDocument();
  });
});
