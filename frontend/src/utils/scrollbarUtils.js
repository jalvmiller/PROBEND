/**
 * Utility classes Tailwind para estilização de scrollbar 
 */
export const SCROLLBAR_CLASSES = `
  [scrollbar-width:thin] 
  [scrollbar-color:rgba(148,163,184,0.5)_transparent] 
  dark:[scrollbar-color:rgba(71,85,105,0.6)_transparent] 
  [&::-webkit-scrollbar]:w-2 
  [&::-webkit-scrollbar]:h-2 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [&::-webkit-scrollbar-thumb]:bg-slate-400/50 
  [&::-webkit-scrollbar-thumb]:rounded-full 
  hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/75 
  dark:[&::-webkit-scrollbar-thumb]:bg-slate-600/50 
  dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/80 
  [&_*::-webkit-scrollbar]:w-2 
  [&_*::-webkit-scrollbar]:h-2 
  [&_*::-webkit-scrollbar-track]:bg-transparent 
  [&_*::-webkit-scrollbar-thumb]:bg-slate-400/50 
  [&_*::-webkit-scrollbar-thumb]:rounded-full 
  hover:[&_*::-webkit-scrollbar-thumb]:bg-slate-500/75 
  dark:[&_*::-webkit-scrollbar-thumb]:bg-slate-600/50 
  dark:hover:[&_*::-webkit-scrollbar-thumb]:bg-slate-500/80
`.replace(/\s+/g, ' ').trim();
