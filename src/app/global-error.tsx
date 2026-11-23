'use client';

/** Last-resort boundary (root layout failed): no shared components, inline styles only. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F8FAFC',
          color: '#303B4D',
          fontFamily: 'Georgia, serif',
        }}
      >
        <main style={{ maxWidth: 520, padding: 32 }}>
          <p style={{ letterSpacing: '0.3em', fontSize: 12, color: '#1746A2' }}>AZURE</p>
          <h1 style={{ color: '#102A56', fontWeight: 500, fontSize: 40, margin: '16px 0' }}>
            The site is temporarily unavailable.
          </h1>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#1746A2',
              color: '#fff',
              border: 0,
              padding: '14px 24px',
              fontSize: 13,
              letterSpacing: '0.16em',
              cursor: 'pointer',
            }}
          >
            TRY AGAIN
          </button>
        </main>
      </body>
    </html>
  );
}
