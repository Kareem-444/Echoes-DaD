import React from 'react';

type Shape = 'circle' | 'hexagon' | 'triangle' | 'square' | 'diamond';
type Size = 'sm' | 'md' | 'lg';

interface GeometricAvatarProps {
  shape: Shape;
  color: string;
  size: Size;
}

const sizeMap = {
  sm: 40,
  md: 56,
  lg: 120,
};

export const GeometricAvatar: React.FC<GeometricAvatarProps> = ({ shape, color, size }) => {
  const s = sizeMap[size];
  const px = `${s}px`;

  // We define different SVG content per shape
  const renderShapeContent = () => {
    switch (shape) {
      case 'circle':
        return (
          <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-circle`} width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="currentColor" opacity="0.4" />
              </pattern>
            </defs>
            <circle cx="50" cy="50" r="50" fill={color} opacity="0.2" />
            <circle cx="50" cy="50" r="50" fill={`url(#pattern-circle)`} />
            <circle cx="50" cy="50" r="40" fill={color} />
          </svg>
        );
      case 'hexagon':
        return (
          <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-hex`} width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 0L8 8ZM8 0L0 8Z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill={color} opacity="0.2" />
            <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill={`url(#pattern-hex)`} />
            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill={color} />
          </svg>
        );
      case 'triangle':
        return (
          <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-tri`} width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="2" fill="currentColor" opacity="0.3" />
              </pattern>
            </defs>
            <polygon points="50,0 100,100 0,100" fill={color} opacity="0.2" />
            <polygon points="50,0 100,100 0,100" fill={`url(#pattern-tri)`} />
            <polygon points="50,20 85,90 15,90" fill={color} />
          </svg>
        );
      case 'square':
        return (
          <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-sq`} width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" rx="16" fill={color} opacity="0.2" />
            <rect width="100" height="100" rx="16" fill={`url(#pattern-sq)`} />
            <rect x="15" y="15" width="70" height="70" rx="10" fill={color} />
          </svg>
        );
      case 'diamond':
      default:
        return (
          <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-dia`} width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 8L8 0" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              </pattern>
            </defs>
            <polygon points="50,0 100,50 50,100 0,50" fill={color} opacity="0.2" />
            <polygon points="50,0 100,50 50,100 0,50" fill={`url(#pattern-dia)`} />
            <polygon points="50,15 85,50 50,85 15,50" fill={color} />
          </svg>
        );
    }
  };

  return (
    <div style={{ width: s, height: s, color }} className="inline-flex flex-shrink-0 items-center justify-center">
      {renderShapeContent()}
    </div>
  );
};
