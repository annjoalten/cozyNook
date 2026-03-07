import { Lora, DM_Sans } from 'next/font/google'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastContainer } from '../components/ToastContainer'
import { StyledComponentsRegistry } from '../lib/registry'
import { ThemeProvider } from '../lib/ThemeProvider'
import './global.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Nook — tu inventario del hogar',
  description: 'Encuentra cualquier cosa en tu casa, aunque hayas olvidado cómo la llamaste.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lora.variable} ${dmSans.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <ToastContainer />
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
