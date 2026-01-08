import { render, screen, fireEvent } from "@testing-library/react";
import { SubmitButton } from "./SubmitButton";
import { describe, it, expect, vi } from "vitest";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("SubmitButton Component", () => {
  it("renders with initial text", () => {
    render(<SubmitButton onClick={() => {}} isLoading={false} text="SUBMIT" loadingText="LOADING" />);
    expect(screen.getByText("SUBMIT")).toBeInTheDocument();
  });

  it("renders with loading text when isLoading is true", () => {
    render(<SubmitButton onClick={() => {}} isLoading={true} text="SUBMIT" loadingText="PROCESSING" />);
    expect(screen.getByText("PROCESSING")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<SubmitButton onClick={handleClick} isLoading={false} text="SUBMIT" loadingText="LOADING" />);
    fireEvent.click(screen.getByText("SUBMIT"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isLoading is true", () => {
    render(<SubmitButton onClick={() => {}} isLoading={true} text="SUBMIT" loadingText="LOADING" />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
