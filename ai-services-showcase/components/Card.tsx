import React from 'react';
import type { CardData } from '../types';

interface CardProps extends Omit<CardData, 'id'> {
  animationDelay: string;
}

const THEMES = {
  purple: {
    gradient: 'from-violet-500 to-purple-500',
    beforeBg: 'before:bg-gradient-to-br before:from-violet-50 before:to-purple-50',
    afterBg: 'after:bg-gradient-to-r after:from-violet-500 after:to-purple-500',
    bulletColor: 'text-violet-500',
    borderColor: 'border-violet-200 hover:border-violet-300',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500',
    beforeBg: 'before:bg-gradient-to-br before:from-indigo-50 before:to-blue-50',
    afterBg: 'after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500',
    bulletColor: 'text-indigo-500',
    borderColor: 'border-indigo-200 hover:border-indigo-300',
  },
  blue: {
    gradient: 'from-blue-500 to-sky-500',
    beforeBg: 'before:bg-gradient-to-br before:from-blue-50 before:to-sky-50',
    afterBg: 'after:bg-gradient-to-r after:from-blue-500 after:to-sky-500',
    bulletColor: 'text-blue-500',
    borderColor: 'border-sky-200 hover:border-sky-300',
  },
  green: {
    gradient: 'from-emerald-500 to-green-500',
    beforeBg: 'before:bg-gradient-to-br before:from-emerald-50 before:to-green-50',
    afterBg: 'after:bg-gradient-to-r after:from-emerald-500 after:to-green-500',
    bulletColor: 'text-emerald-500',
    borderColor: 'border-emerald-200 hover:border-emerald-300',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    beforeBg: 'before:bg-gradient-to-br before:from-pink-50 before:to-rose-50',
    afterBg: 'after:bg-gradient-to-r after:from-pink-500 after:to-rose-500',
    bulletColor: 'text-pink-500',
    borderColor: 'border-pink-200 hover:border-pink-300',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-500',
    beforeBg: 'before:bg-gradient-to-br before:from-teal-50 before:to-cyan-50',
    afterBg: 'after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500',
    bulletColor: 'text-teal-500',
    borderColor: 'border-cyan-200 hover:border-cyan-300',
  },
};

const Card: React.FC<CardProps> = ({ title, icon: Icon, listItems, description, theme, animationDelay }) => {
  const currentTheme = THEMES[theme];

  return (
    <div
      className={`group relative bg-white bg-opacity-60 backdrop-blur-sm p-7 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border shadow-lg hover:shadow-2xl hover:-translate-y-3 animate-fadeInUp ${currentTheme.beforeBg} ${currentTheme.afterBg} ${currentTheme.borderColor}`}
      style={{ animationDelay }}
    >
      {/* Background Hover Effect */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-95 transition-opacity duration-400" />
      
      {/* Top Border Hover Effect */}
      <div className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      <div className="relative z-10 flex flex-col">
        <header className="flex items-center gap-4 mb-4">
          <Icon className={`w-12 h-12 flex-shrink-0 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-120 group-hover:rotate-12 ${currentTheme.bulletColor}`} />
          <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{title}</h3>
        </header>
        
        <ul className="list-none mb-4 space-y-1">
          {listItems.map((item, index) => (
            <li key={index} className="text-gray-600 pl-6 relative text-base group-hover:text-gray-900 transition-colors duration-300">
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current ${currentTheme.bulletColor}`} />
              {item}
            </li>
          ))}
        </ul>
        
        <p className="text-gray-500 text-sm font-semibold pt-4 border-t border-gray-900/10">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Card;