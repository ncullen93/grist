interface PageHeaderProps {
  title: string;
  leftContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, leftContent, children }: PageHeaderProps) {
  return (
    <header className="px-4 md:px-8 h-18 flex items-center justify-between bg-background shrink-0 border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <h1 className="text-xl md:text-2xl font-semibold font-display text-foreground">
          {title}
        </h1>
        {leftContent}
      </div>
      {children && (
        <div className="flex items-center gap-2 mr-12 md:mr-16">
          {children}
        </div>
      )}
    </header>
  );
}
