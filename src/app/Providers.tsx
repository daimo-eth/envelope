'use client'

import React from 'react'
import { DaimoPayProvider, getDefaultConfig } from '@daimo/pay'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig } from 'wagmi'

const config = createConfig(
  getDefaultConfig({
    appName: 'Surprise Envelope',
    ssr: true,
  }),
)

const queryClient = new QueryClient()

const customTheme = {
  "--ck-font-family": "Inter",
  "--ck-font-weight": "400",
  "--ck-border-radius": "20px",
  "--ck-overlay-backdrop-filter": "blur(0px)",
  "--ck-modal-heading-font-weight": "500",
  "--ck-qr-border-radius": "16px",
  
  // Connect button - adapting to amber theme
  "--ck-connectbutton-font-size": "15px",
  "--ck-connectbutton-color": "#78350f", // amber-900
  "--ck-connectbutton-background": "#fffbeb", // amber-50
  "--ck-connectbutton-background-secondary": "#fff9f0", // paper bg color
  "--ck-connectbutton-border-radius": "16px",
  "--ck-connectbutton-box-shadow": "0 0 0 1px #fcd34d", // amber-300
  "--ck-connectbutton-hover-color": "#78350f", // amber-900
  "--ck-connectbutton-hover-background": "#fef3c7", // amber-100
  "--ck-connectbutton-hover-box-shadow": "0 0 0 1px #fbbf24", // amber-400
  
  "--ck-connectbutton-active-color": "#78350f", // amber-900
  "--ck-connectbutton-active-background": "#fde68a", // amber-200
  "--ck-connectbutton-active-box-shadow": "0 0 0 1px #f59e0b", // amber-500
  "--ck-connectbutton-balance-color": "#78350f", // amber-900
  "--ck-connectbutton-balance-background": "#fff9f0", // paper bg
  "--ck-connectbutton-balance-box-shadow": "inset 0 0 0 1px #fcd34d", // amber-300
  "--ck-connectbutton-balance-hover-background": "#fffbeb", // amber-50
  "--ck-connectbutton-balance-hover-box-shadow": "inset 0 0 0 1px #fbbf24", // amber-400
  "--ck-connectbutton-balance-active-background": "#fef3c7", // amber-100
  "--ck-connectbutton-balance-active-box-shadow": "inset 0 0 0 1px #f59e0b", // amber-500
  
  // Primary button - using amber-600 as primary
  "--ck-primary-button-font-weight": "600",
  "--ck-primary-button-border-radius": "16px",
  "--ck-primary-button-color": "#ffffff", // white
  "--ck-primary-button-background": "#d97706", // amber-600
  "--ck-primary-button-box-shadow": "0 0 0 0 #ffffff",
  "--ck-primary-button-hover-color": "#ffffff", // white
  "--ck-primary-button-hover-background": "#b45309", // amber-700
  "--ck-primary-button-hover-box-shadow": "0 0 0 0 #ffffff",
  "--ck-primary-button-active-color": "#ffffff", // white
  "--ck-primary-button-active-background": "#92400e", // amber-800
  "--ck-primary-button-active-box-shadow": "0 0 0 0 #ffffff",
  
  // Secondary button
  "--ck-secondary-button-font-weight": "500",
  "--ck-secondary-button-border-radius": "16px",
  "--ck-secondary-button-color": "#78350f", // amber-900
  "--ck-secondary-button-background": "#fffbeb", // amber-50
  "--ck-secondary-button-box-shadow": "0 0 0 1px #fcd34d", // amber-300
  "--ck-secondary-button-hover-color": "#78350f", // amber-900
  "--ck-secondary-button-hover-background": "#fef3c7", // amber-100
  "--ck-secondary-button-hover-box-shadow": "0 0 0 1px #fbbf24", // amber-400
  "--ck-secondary-button-active-color": "#78350f", // amber-900
  "--ck-secondary-button-active-background": "#fde68a", // amber-200
  "--ck-secondary-button-active-box-shadow": "0 0 0 1px #f59e0b", // amber-500
  
  // Tertiary button
  "--ck-tertiary-button-font-weight": "500",
  "--ck-tertiary-button-border-radius": "16px",
  "--ck-tertiary-button-color": "#b45309", // amber-700
  "--ck-tertiary-button-background": "#fffbeb", // amber-50
  "--ck-tertiary-button-box-shadow": "0 0 0 0 #ffffff",
  "--ck-tertiary-button-hover-color": "#92400e", // amber-800
  "--ck-tertiary-button-hover-background": "#fef3c7", // amber-100
  "--ck-tertiary-button-hover-box-shadow": "0 0 0 0 #ffffff",
  "--ck-tertiary-button-active-color": "#78350f", // amber-900
  "--ck-tertiary-button-active-background": "#fde68a", // amber-200
  "--ck-tertiary-button-active-box-shadow": "0 0 0 0 #ffffff",
  
  // Modal and overlay
  "--ck-modal-box-shadow": "0px 2px 4px 0px rgba(0,0,0,0.05)",
  "--ck-overlay-background": "rgba(0,0,0,0.08)",
  
  // Body elements
  "--ck-body-color": "#78350f", // amber-900
  "--ck-body-color-muted": "#b45309", // amber-700
  "--ck-body-color-muted-hover": "#92400e", // amber-800
  "--ck-body-background": "#fff9f0", // paper bg color
  "--ck-body-background-transparent": "rgba(255,249,240,0)", // transparent paper bg
  "--ck-body-background-secondary": "#fffbeb", // amber-50
  "--ck-body-background-secondary-hover-background": "#fef3c7", // amber-100
  "--ck-body-background-secondary-hover-outline": "#fcd34d", // amber-300
  "--ck-body-background-tertiary": "#fde68a", // amber-200
  "--ck-body-action-color": "#d97706", // amber-600
  "--ck-body-divider": "#fcd34d", // amber-300
  
  // System colors
  "--ck-body-color-danger": "#FF4E4E", // keep red for danger
  "--ck-body-color-valid": "#32D74B", // keep green for valid
  "--ck-siwe-border": "#fde68a", // amber-200
  
  // Disclaimer
  "--ck-body-disclaimer-background": "#fffbeb", // amber-50
  "--ck-body-disclaimer-color": "#d97706", // amber-600
  "--ck-body-disclaimer-link-color": "#b45309", // amber-700
  "--ck-body-disclaimer-link-hover-color": "#78350f", // amber-900
  
  // Tooltip
  "--ck-tooltip-background": "#fff9f0", // paper bg color
  "--ck-tooltip-background-secondary": "#fffbeb", // amber-50
  "--ck-tooltip-color": "#b45309", // amber-700
  "--ck-tooltip-shadow": "0px 2px 10px 0 rgba(0,0,0,0.08)",
  
  // Dropdown
  "--ck-dropdown-button-color": "#b45309", // amber-700
  "--ck-dropdown-button-box-shadow": "0 0 0 1px rgba(0,0,0,0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
  "--ck-dropdown-button-background": "#fff9f0", // paper bg color
  "--ck-dropdown-button-hover-color": "#92400e", // amber-800
  "--ck-dropdown-button-hover-background": "#fffbeb", // amber-50
  
  // QR code
  "--ck-qr-dot-color": "#b45309", // amber-700
  "--ck-qr-background": "#fff9f0", // paper bg color
  "--ck-qr-border-color": "#fcd34d", // amber-300
  
  // Miscellaneous
  "--ck-focus-color": "#f59e0b", // amber-500
  "--ck-spinner-color": "#d97706", // amber-600
  "--ck-copytoclipboard-stroke": "#fbbf24", // amber-400
  "--ck-recent-badge-color": "#b45309", // amber-700
  "--ck-recent-badge-background": "#fffbeb", // amber-50
  "--ck-recent-badge-border-radius": "32px"
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider customTheme={customTheme}>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 