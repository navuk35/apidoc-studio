import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Code, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasSpec?: boolean;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  hasSpec = false
}) => {
  const tabs: TabItem[] = [
    {
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      disabled: false
    },
    {
      id: 'viewer',
      label: 'Viewer',
      icon: FileText,
      disabled: !hasSpec
    },
    {
      id: 'editor',
      label: 'Editor',
      icon: Code,
      disabled: !hasSpec
    },
    {
      id: 'try-it',
      label: 'Try It',
      icon: Play,
      disabled: !hasSpec
    }
  ];

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center px-6 py-2">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                disabled={isDisabled}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-none border-b-2 border-transparent",
                  "hover:bg-muted/50 hover:border-muted-foreground/20",
                  isActive && "bg-muted border-primary text-primary",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};