'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open = true, onOpenChange, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => onOpenChange?.(false)}
        />
        <div
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-gray-200 bg-white shadow-lg rounded-lg',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);

ModalContent.displayName = 'ModalContent';

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-b px-6 py-4', className)} {...props} />
  )
);

ModalHeader.displayName = 'ModalHeader';

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  )
);

ModalTitle.displayName = 'ModalTitle';
