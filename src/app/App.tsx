import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';

import { LanguageProvider }      from './context/LanguageContext';
import { ConversationProvider }  from './context/ConversationContext';
import { DemoProvider } from './context/DemoContext';
import { LegalTermDialog } from './components/demo/LegalTerms';
import { DemoDisclosure } from './components/demo/GuardrailGallery';
import { TYPE } from './components/shared';


export default function App() {
  return (
    <DemoProvider>
      <LanguageProvider>
        <ConversationProvider>
          <RouterProvider router={router} />
          <LegalTermDialog />
          <DemoDisclosure />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: TYPE.small.size,
              },
            }}
          />
        </ConversationProvider>
      </LanguageProvider>
    </DemoProvider>
  );
}
