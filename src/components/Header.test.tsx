import { render, screen } from "@testing-library/react";
import { Header } from "./Header";
import { describe, it, expect, vi } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("Header Component", () => {
  it("renders the title", () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Title/i)).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<Header title="Test Title" description="Test Description" />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("shows initial checking status", () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText("DETERMINING_STABILITY...")).toBeInTheDocument();
  });
});
