
import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ name, size = 24, className = '', color }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} style={{ color }} />;
};

export default IconRenderer;
