'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Critical Error
            </h2>
            <p style={{ marginBottom: '24px', color: '#666' }}>
              The application encountered a critical error. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
