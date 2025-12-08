import React from 'react';

const Card = ({ children, className = '', onClick, ...props }) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

export default Card;