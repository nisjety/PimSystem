import React from 'react';
import { Widget } from '../../../types/widget';

const ProductMetricsWidget: React.FC<Widget> = () => {
  return (
    <div className="h-full w-full p-4">
      <h3 className="text-lg font-semibold mb-4">Product Metrics</h3>
      {/* Add your widget content here */}
    </div>
  );
};

export default ProductMetricsWidget;
