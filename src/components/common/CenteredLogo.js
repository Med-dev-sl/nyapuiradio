import React from 'react';

const CenteredLogo = ({ className = "size-20" }) => {
  return (
    <img 
      src="/logo192.png" 
      alt="Nyapui Radio Logo" 
      className={`${className} object-contain`}
    />
  );
};

export default CenteredLogo;
