import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actions && (
        <div className="flex items-center gap-2 md:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
} 