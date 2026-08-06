import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import React from 'react';
import { DialogRenderer } from '@/components/custom-ui/dialog/DialogRenderer';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DialogRenderer />
    </QueryClientProvider>
  );
}
