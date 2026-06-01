import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

import { LanguageProvider }      from './context/LanguageContext';
import { ConversationProvider }  from './context/ConversationContext';

export default function App() {
  return (
    <LanguageProvider>
      <ConversationProvider>
        <RouterProvider router={router} />
      </ConversationProvider>
    </LanguageProvider>
  );
}
