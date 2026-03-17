import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AlertProvider } from './context/AlertContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProvider } from './Component/UserProvider'

import { ThemeProvider } from "@mui/material";
import { theme } from "./utils/theme";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <UserProvider>
            <AlertProvider>
              <App />
            </AlertProvider>
          </UserProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
