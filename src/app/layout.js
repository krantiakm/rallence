import "./globals.css";

export const metadata = {
  title: "Rallence — Demand-Led Real-World Experiences",
  description: "Rally around offline experiences you wish existed. Rallence converts collective desire into structured demand, letting local venues and creators host them.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <header className="navbar">
            <a href="/" className="logo">
              Rallence
              <span>Bangalore</span>
            </a>
            
            <nav className="nav-links">
              <a href="/" className="nav-link">Feed</a>
              <a href="/proposals/create" className="nav-link">Propose</a>
              <a href="/radar" className="nav-link">Provider Radar</a>
              <a href="/profile/admin" className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
                    alt="Kranti" 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>Kranti (320 pts)</span>
                </span>
              </a>
            </nav>
          </header>

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
