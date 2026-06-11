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
              <span>BLR</span>
            </a>
            
            <nav className="nav-links">
              <a href="/" className="nav-link">Feed</a>
              <a href="/proposals/create" className="nav-link">Propose</a>
              <a href="/radar" className="nav-link">Radar</a>
              <a href="/profile/admin" className="nav-profile-btn" title="Kranti's Profile">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
                  alt="Kranti" 
                  className="nav-avatar"
                />
                <span className="nav-points">320p</span>
              </a>
            </nav>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer style={{ 
            padding: '1.5rem 1rem', 
            textAlign: 'center', 
            fontSize: '0.75rem', 
            color: 'var(--bg-neutral-muted)', 
            borderTop: '1px solid var(--border-color)', 
            background: 'var(--bg-cream)',
            zIndex: 10
          }}>
            Rallence · Build: v1.0.9
          </footer>
        </div>
      </body>
    </html>
  );
}
