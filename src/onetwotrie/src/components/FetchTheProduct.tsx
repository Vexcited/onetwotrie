import React from 'react';

interface ProductProps {
  barcode: Number;
}

const FetchTheProduct: React.FC<ProductProps> = ({ barcode }) => {
  return (
    <div className="container">
      <strong>{barcode}</strong>
    </div>
  );
};

export default FetchTheProduct;
