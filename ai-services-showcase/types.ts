
import type React from 'react';

export interface CardData {
  id: number;
  title: string;
  icon: React.FC<{ className?: string, style?: React.CSSProperties }>;
  listItems: string[];
  description: string;
  theme: 'purple' | 'indigo' | 'blue' | 'green' | 'pink' | 'teal';
}
