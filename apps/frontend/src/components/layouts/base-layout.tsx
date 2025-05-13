import { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
}

export function BaseLayout({ children, header, sidebar }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header && (
        <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
          {header}
        </header>
      )}
      
      {sidebar && (
        <aside className="fixed left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200">
          {sidebar}
        </aside>
      )}

      <main className={`p-4 ${sidebar ? 'sm:ml-64' : ''} ${header ? 'pt-20' : ''}`}>
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
