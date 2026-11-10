import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'stock' | 'order' | 'payment' | 'role' | 'enquiry' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace(/_/g, ' ');

  const upper = status.toUpperCase();

  if (type === 'stock' || upper === 'IN_STOCK' || upper === 'ACTIVE' || upper === 'RESOLVED' || upper === 'DELIVERED' || upper === 'PAID') {
    if (upper === 'IN_STOCK' || upper === 'ACTIVE' || upper === 'RESOLVED' || upper === 'DELIVERED' || upper === 'PAID') {
      colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (upper === 'LOW_STOCK' || upper === 'PENDING' || upper === 'IN_PROGRESS' || upper === 'PROCESSING') {
      colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (upper === 'OUT_OF_STOCK' || upper === 'CANCELLED' || upper === 'FAILED' || upper === 'BLOCKED' || upper === 'INACTIVE') {
      colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (upper === 'SHIPPED' || upper === 'CONFIRMED') {
      colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
    }
  } else if (type === 'role') {
    switch (upper) {
      case 'SUPER_ADMIN':
        colorStyles = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
        label = 'Super Admin';
        break;
      case 'ADMIN':
        colorStyles = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
        label = 'Admin / Manager';
        break;
      case 'INVENTORY_MANAGER':
        colorStyles = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        label = 'Inventory Mgr';
        break;
      case 'SALES_STAFF':
        colorStyles = 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
        label = 'Sales Staff';
        break;
      default:
        break;
    }
  } else {
    if (['NEW'].includes(upper)) {
      colorStyles = 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (['PERCENTAGE'].includes(upper)) {
      colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (['FIXED'].includes(upper)) {
      colorStyles = 'bg-teal-50 text-teal-700 border-teal-200';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorStyles}`}
    >
      {label}
    </span>
  );
};

