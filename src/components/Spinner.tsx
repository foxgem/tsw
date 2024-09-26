import React from 'react';

interface SpinnerProps {
  title?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ title = "Loading" }) => {


  return (
    <div className='tsw-spinner'>
      <div className="loading-spinner"></div>
      <p>{title}...</p>
    </div>
  );
};

export default Spinner;