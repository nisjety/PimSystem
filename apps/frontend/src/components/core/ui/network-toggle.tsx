import React from 'react';
import { Zap } from 'lucide-react';

// Network toggle component
function NetworkToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-300 ${
        active ? 'bg-primary-500 text-white' : 'bg-white/80 dark:bg-white/5 backdrop-blur-sm text-muted-foreground'
      }`}
      aria-label={active ? 'Deactivate network visualization' : 'Activate network visualization'}
    >
      <Zap size={16} className={`transition-all ${active ? 'scale-110' : 'scale-90 opacity-70'}`} />
      <span className="absolute -bottom-6 whitespace-nowrap text-[10px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {active ? 'Network Active' : 'Network Inactive'}
      </span>
    </button>
  );
}

export default NetworkToggle;