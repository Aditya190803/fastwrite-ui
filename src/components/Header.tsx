
import React from "react";

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <header className="text-center mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{title}</h1>
      {description && (
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto px-2">
          {description}
        </p>
      )}
    </header>
  );
};
