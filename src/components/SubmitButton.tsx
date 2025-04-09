
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  text: string;
  loadingText: string;
}

export const SubmitButton = ({ onClick, isLoading, text, loadingText }: SubmitButtonProps) => {
  return (
    <div className="flex justify-center mb-8">
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto md:px-8 py-4 md:py-6 text-base md:text-lg"
      >
        {isLoading ? loadingText : text}
      </Button>
    </div>
  );
};
