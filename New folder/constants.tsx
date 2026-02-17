
import React from 'react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Furniture',
  'Books',
  'Toys',
  'Electronics',
  'Clothing',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Furniture: 'bg-amber-500',
  Books: 'bg-blue-500',
  Toys: 'bg-red-500',
  Electronics: 'bg-purple-500',
  Clothing: 'bg-green-500',
  Other: 'bg-gray-500'
};

// Sofia, Bulgaria as the default center
export const DEFAULT_CENTER = { lat: 42.6977, lng: 23.3219 };

// Bounds to exclude US and most of Africa
// SW: [30, -30] (Cuts off US and Sub-Saharan Africa)
// NE: [85, 180] (Includes Europe and Asia)
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [30.0, -30.0],
  [85.0, 180.0]
];
