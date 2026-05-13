import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.tsx"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { Toaster } from "./components/ui/sonner.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  </StrictMode>,
)
