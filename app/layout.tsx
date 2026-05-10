// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
// ✅ REMOVED: import { Analytics } from '@vercel/analytics/next'
import WalletProvider from '@/components/WalletProvider'
import { UserProvider } from '@/components/UserContext'
import RoleSelector from '@/components/RoleSelector'
import '../styles/globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// ✅ Metadata export
export const metadata: Metadata = {
  title: 'BetAman - Home Fraud Detection',
  description: 'AI-powered real estate fraud detection with Web3 escrow verification',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/images/logo.jpg',
      },
    ],
  },
}

// ✅ Viewport as SEPARATE export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body 
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        
        <WalletProvider>
          <UserProvider>
            {/* ✅ RoleSelector MUST be inside UserProvider to use useUser() */}
            <RoleSelector />
            
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-[#0f0f0f]" />
              <div className="absolute inset-0 opacity-5">
                <img src="/images/house-1.jpg" alt="" className="absolute w-96 h-96 object-cover -top-20 -left-20" />
                <img src="/images/house-2.jpg" alt="" className="absolute w-96 h-96 object-cover -bottom-20 -right-20" />
                <img src="/images/house-3.jpg" alt="" className="absolute w-80 h-80 object-cover top-1/3 right-1/4" />
              </div>
            </div>
            <div className="relative z-10">
              {children}
            </div>
            {/* ✅ REMOVED: {process.env.NODE_ENV === 'production' && <Analytics />} */}
          </UserProvider>
        </WalletProvider>
        
      </body>
    </html>
  )
}