import React from 'react';
import { getBasicColumnValue } from '../utils/dataUtils.js';

export const ColumnValue = ({ registration, column }) => {
  if (column === 'Payment Status') {
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        registration.paymentStatus === 'completed' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-orange-500/20 text-orange-400'
      }`}>
        {registration.paymentStatus || 'N/A'}
      </span>
    );
  }

  return <span>{getBasicColumnValue(registration, column)}</span>;
};