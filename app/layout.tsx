import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daniel De La Rosa',
  description: 'Project pages and estimates.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://www.beingl.ink/files/jii-management/fonts/web/foundersgrotesk.css"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
