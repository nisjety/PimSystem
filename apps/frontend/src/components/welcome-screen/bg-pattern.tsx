'use client';

export function BgPattern() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
      <svg className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2" aria-hidden="true">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M.5 40V.5H40" fill="none" stroke="currentColor"></path>
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)"></rect>
      </svg>
    </div>
  );
}
