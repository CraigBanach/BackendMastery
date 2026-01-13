"use client";

import { ReactNode, useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalManager } from "@/lib/providers/modal-provider";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  maxHeight?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
  maxHeight = '90vh'
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { requestOpen, release } = useModalManager();
  const [hasLock, setHasLock] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasLock(false);
      return;
    }

    const didOpen = requestOpen();
    if (!didOpen) {
      onClose();
      return;
    }

    setHasLock(true);

    return () => {
      release();
      setHasLock(false);
    };
  }, [isOpen, onClose, release, requestOpen]);

  if (!isOpen || !hasLock) return null;


  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div 
        className={`bg-white rounded-lg ${maxWidthClasses[maxWidth]} w-full overflow-hidden flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        style={{ maxHeight }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold" id={titleId}>{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t bg-gray-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
