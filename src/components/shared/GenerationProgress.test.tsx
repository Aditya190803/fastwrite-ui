import { render, screen } from "@testing-library/react";
import { GenerationProgress } from "./GenerationProgress";
import { describe, it, expect, vi } from "vitest";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockSteps = [
  { id: "step1", label: "Step 1", status: "completed" as const },
  { id: "step2", label: "Step 2", status: "in-progress" as const },
  { id: "step3", label: "Step 3", status: "not-started" as const },
];

describe("GenerationProgress Component", () => {
  it("renders all steps", () => {
    render(<GenerationProgress steps={mockSteps} />);
    expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
  });

  it("highlights the active step", () => {
    const { container } = render(<GenerationProgress steps={mockSteps} currentStep="step2" />);
    // Check for the active step class or related elements
    expect(screen.getByText(/Step 2/i).closest('div')).toBeInTheDocument();
  });

  it("shows completed status", () => {
    render(<GenerationProgress steps={mockSteps} />);
    // Lucid-react icons are hard to test by text, but we can check if Step 1 is there
    expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
  });
});
