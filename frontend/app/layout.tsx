import './globals.css'
import type { Metadata } from 'next'
import Header from './Header'

export const metadata: Metadata = {
  title: 'Sistema de Turnos Zentricx',
  description: 'Sistema de gestión de turnos médicos Zentricx',
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className="min-h-screen"
        style={{ backgroundColor: '#e2e2e2ff' }}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}