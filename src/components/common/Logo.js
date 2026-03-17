import React from 'react';

const Logo = ({ className = "size-8", variant = "default" }) => {
  const containerClasses = variant === "primary" 
    ? "bg-primary p-1 rounded-lg text-white" 
    : "bg-primary/10 p-1.5 rounded-xl border border-primary/20";

  return (
    <div className={`${containerClasses} flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      <img 
        src="/logo512.png" 
        alt="Nyapui Radio Logo" 
        className="w-full h-full object-contain brightness-110 drop-shadow-sm"
      />
    </div>
  );
};

export default Logo;
