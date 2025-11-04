
import React from 'react';

interface IconProps {
    className?: string;
    style?: React.CSSProperties;
}

export const DesignIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="palette" className={className} style={style}></i>
);

export const VideoIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="video" className={className} style={style}></i>
);

export const CodeIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="code-2" className={className} style={style}></i>
);

export const MarketingIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="megaphone" className={className} style={style}></i>
);

export const PromptIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="wand-2" className={className} style={style}></i>
);

export const GrowthIcon: React.FC<IconProps> = ({ className, style }) => (
  <i data-lucide="trending-up" className={className} style={style}></i>
);
