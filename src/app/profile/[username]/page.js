"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function UserProfile() {
  const params = useParams();
  const username = params.username;
  const [profile, setProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Curation Tuner states
  const [foodVal, setFoodVal] = useState(50);
  const [socialVal, setSocialVal] = useState(50);
  const [perfVal, setPerfVal] = useState(50);
  const [outdoorsVal, setOutdoorsVal] = useState(50);
  const [budgetValue, setBudgetValue] = useState(3000);
  const [availValue, setAvailValue] = useState("Weekends");
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'error', 'idle'

  // Share Modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch all profile details & active proposals
  const fetchData = async () => {
    try {
      const profileRes = await fetch(`/api/users/${username}`);
      const profileData = await profileRes.json();
      
      const proposalsRes = await fetch('/api/proposals');
      const proposalsData = await proposalsRes.json();

      if (profileData.success) {
        const p = profileData.profile;
        setProfile(p);
        
        // Seed slider states based on database record
        const pcp = p.pcpProfile || {};
        const cats = pcp.categories || [];
        setFoodVal(cats.includes("Food") ? 80 : 20);
        setSocialVal(cats.includes("Social") ? 80 : 20);
        setPerfVal(cats.includes("Performance") ? 80 : 20);
        setOutdoorsVal(cats.includes("Outdoors") ? 80 : 20);
        
        let budgetNum = 3000;
        if (pcp.budget === "Low") budgetNum = 1200;
        else if (pcp.budget === "High") budgetNum = 5000;
        setBudgetValue(budgetNum);
        
        setAvailValue(pcp.availability || "Weekends");
        setIsLoaded(true);
      }
      
      if (proposalsData.success) {
        // Filter proposals created by this user
        const userProps = proposalsData.proposals.filter(pr => pr.creatorId === username);
        setProposals(userProps);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load Scout Space data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username]);

  // Debounced auto-sync to backend
  useEffect(() => {
    if (!isLoaded) return;

    const saveChanges = async () => {
      setSyncStatus('saving');
      
      // Determine categories based on sliders (> 30% affinity)
      const categories = [];
      if (foodVal > 30) categories.push("Food");
      if (socialVal > 30) categories.push("Social");
      if (perfVal > 30) categories.push("Performance");
      if (outdoorsVal > 30) categories.push("Outdoors");
      
      let budgetTier = "Medium";
      if (budgetValue < 2000) budgetTier = "Low";
      else if (budgetValue > 4000) budgetTier = "High";

      try {
        const res = await fetch(`/api/users/${username}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pcpProfile: {
              categories,
              budget: budgetTier,
              availability: availValue
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          setSyncStatus('synced');
          // Smoothly clear sync status indicator after a moment
          setTimeout(() => setSyncStatus('idle'), 2000);
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error("Failed to sync curation board:", err);
        setSyncStatus('error');
      }
    };

    const handler = setTimeout(() => {
      saveChanges();
    }, 600);

    return () => clearTimeout(handler);
  }, [foodVal, socialVal, perfVal, outdoorsVal, budgetValue, availValue]);

  const copyShareLink = async () => {
    const link = `${window.location.origin}/profile/${username}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--bg-neutral-muted)', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
        Accessing Scout portfolio records...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
        Scout portfolio record not found.
      </div>
    );
  }

  return (
    <div className="scout-space-container">
      
      {/* Scout Identity Header */}
      <div className="scout-header-card">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-terracotta)', padding: '3px', background: 'var(--bg-paper)' }} 
          />
          <span style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-sage)', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--bg-paper)' }} title="Scout Active" />
        </div>
        
        <div className="scout-meta-block">
          <div className="scout-title-row">
            <h1 className="scout-name">
              {profile.name}
            </h1>
            <span className="badge badge-scout">{profile.badge}</span>
          </div>
          <p className="scout-username-text">
            Scout Username: <strong>@{profile.username}</strong> · Chapter location: <strong>Bangalore Chapter</strong>
          </p>
          
          <div className="scout-stats-grid">
            <div className="scout-stat-card">
              <div className="val">{profile.points}p</div>
              <div className="label">Resonance Index</div>
            </div>
            <div className="scout-stat-card">
              <div className="val">{proposals.length}</div>
              <div className="label">Proposals Founded</div>
            </div>
            <div className="scout-stat-card">
              <div className="val">{profile.contributions.filter(c => c.actionType === 'RALLY').length + 5}</div>
              <div className="label">Collective Rallies</div>
            </div>
          </div>
        </div>

        <div className="scout-action-block">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowShareModal(true)}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem', whiteSpace: 'nowrap', width: '100%' }}
          >
            Share Scout Portfolio
          </button>
        </div>
      </div>

      {/* Main Grid: Left Toolkit & Timeline, Right Tuner */}
      <div className="scout-space-grid">
        
        {/* Left Column: Toolkit & Logbook */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Creator Toolkit */}
          <div>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--bg-neutral-dark)' }}>
              Creator Toolkit
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--bg-neutral-muted)', marginBottom: '1.5rem' }}>
              Initiate the next wave of city desire, or manage your active campaigns.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Propose suggestions */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-sage)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Propose the Next Wave
                </h3>
                <div className="toolkit-grid">
                  <a href="/proposals/create?template=0" className="toolkit-card">
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--bg-neutral-dark)', margin: 0 }}>
                        Secret Japanese Supper Club
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
                        5-course washoku & sake flights counter reservation.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: '600' }}>Rally Supper →</span>
                  </a>

                  <a href="/proposals/create?template=1" className="toolkit-card">
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--bg-neutral-dark)', margin: 0 }}>
                        Sunset Terraces Chamber Gig
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
                        Acoustic string quartet and organic natural wine pours.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: '600' }}>Resonate Concert →</span>
                  </a>
                </div>
              </div>

              {/* My active campaigns */}
              {proposals.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-terracotta)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    My Active Campaigns ({proposals.length})
                  </h3>
                  <div className="toolkit-grid">
                    {proposals.map((prop) => {
                      const isActivated = prop.status === 'ACTIVATED';
                      const backers = prop.supporters.length + (prop.supporterCountOffset || 0);
                      
                      return (
                        <a 
                          href={`/proposals/${prop.id}`} 
                          key={prop.id}
                          className={`toolkit-card active-campaign-card ${isActivated ? 'activated-campaign' : ''}`}
                        >
                          <div>
                            <span 
                              style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '700', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                background: isActivated ? 'var(--accent-sage-light)' : 'var(--accent-terracotta-light)',
                                color: isActivated ? 'var(--accent-sage)' : 'var(--accent-terracotta)',
                                display: 'inline-block',
                                marginBottom: '0.5rem'
                              }}
                            >
                              {prop.status.replace('_', ' ')}
                            </span>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--bg-neutral-dark)', margin: 0 }}>
                              {prop.title}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
                              {backers} Backers · {prop.bids.length} venue bids received
                            </p>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-dark)', fontWeight: '600' }}>
                            {isActivated ? "Manage Event →" : prop.bids.length > 0 ? "Review Venue Bids →" : "View Progress →"}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scout Logbook */}
          <div>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--bg-neutral-dark)' }}>
              Scout Logbook
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--bg-neutral-muted)', marginBottom: '1.5rem' }}>
              Chronological log of your offline impact and mobilized city resonance.
            </p>

            <div className="profile-timeline">
              {profile.contributions.map((cnt) => {
                const date = new Date(cnt.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                
                let actionPoints = "+100";
                if (cnt.actionType === 'RALLY') actionPoints = "+15";
                if (cnt.actionType === 'ACTIVATE') actionPoints = "+250";

                return (
                  <div className="timeline-item" key={cnt.id}>
                    <div className={`timeline-dot ${cnt.actionType === 'ACTIVATE' ? 'activated' : ''}`} />
                    
                    <div className="timeline-content" style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="timeline-time">{date}</span>
                        <span className="logbook-points">{actionPoints} pts</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span className="timeline-title" style={{ fontSize: '0.95rem' }}>{cnt.description}</span>
                        
                        <span 
                          className="badge" 
                          style={{ 
                            marginLeft: 'auto', 
                            fontSize: '0.6rem', 
                            padding: '1px 6px',
                            background: cnt.actionType === 'CREATE' ? 'var(--accent-terracotta-light)' 
                                      : cnt.actionType === 'RALLY' ? 'var(--accent-sage-light)' 
                                      : cnt.actionType === 'ACTIVATE' ? '#EAE6DF' : 'var(--bg-cream)',
                            color: cnt.actionType === 'CREATE' ? 'var(--accent-terracotta)' 
                                 : cnt.actionType === 'RALLY' ? 'var(--accent-sage)' 
                                 : cnt.actionType === 'ACTIVATE' ? 'var(--bg-neutral-dark)' : 'var(--bg-neutral-muted)'
                          }}
                        >
                          {cnt.actionType}
                        </span>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <a 
                          href={`/proposals/${cnt.proposalId}`} 
                          style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: '600', textDecoration: 'none' }}
                        >
                          View Experience Details →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: PCP Tuner */}
        <div>
          <div className="tuner-board" style={{ position: 'sticky', top: '2rem' }}>
            <div className="tuner-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--bg-neutral-dark)', margin: 0 }}>
                  Personal Context
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)', marginTop: '0.15rem' }}>
                  Protocol Curation Tuner
                </div>
              </div>
              
              {/* Live sync indicator */}
              {syncStatus === 'saving' && (
                <span className="tuner-sync-badge" style={{ background: 'var(--accent-terracotta-light)', color: 'var(--accent-terracotta)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="spin" style={{ animation: 'spin 1s linear infinite' }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  Syncing...
                </span>
              )}
              {syncStatus === 'synced' && (
                <span className="tuner-sync-badge">✓ Tuned</span>
              )}
              {syncStatus === 'idle' && (
                <span className="tuner-sync-badge" style={{ opacity: 0.7 }}>● Active</span>
              )}
              {syncStatus === 'error' && (
                <span className="tuner-sync-badge" style={{ background: '#FCECEB', color: '#C73E3E' }}>⚠ Sync Error</span>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-muted)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              Your Personal Context Protocol (PCP) curates your home feed. Slide categories up or down to tune proposal visibility.
            </p>

            <div className="tuner-control-group">
              
              {/* Food Slider */}
              <div className="tuner-control">
                <div className="tuner-control-label">
                  <span>Gastronomy & Food</span>
                  <span className="value">{foodVal}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={foodVal} 
                  onChange={(e) => setFoodVal(parseInt(e.target.value))}
                  className="tuner-slider"
                />
              </div>

              {/* Social Slider */}
              <div className="tuner-control">
                <div className="tuner-control-label">
                  <span>Founder Clubs & Socials</span>
                  <span className="value">{socialVal}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={socialVal} 
                  onChange={(e) => setSocialVal(parseInt(e.target.value))}
                  className="tuner-slider"
                />
              </div>

              {/* Performance Slider */}
              <div className="tuner-control">
                <div className="tuner-control-label">
                  <span>Acoustic & Live Gigs</span>
                  <span className="value">{perfVal}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={perfVal} 
                  onChange={(e) => setPerfVal(parseInt(e.target.value))}
                  className="tuner-slider slider-sage"
                />
              </div>

              {/* Outdoors Slider */}
              <div className="tuner-control">
                <div className="tuner-control-label">
                  <span>Nature Excursions</span>
                  <span className="value">{outdoorsVal}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={outdoorsVal} 
                  onChange={(e) => setOutdoorsVal(parseInt(e.target.value))}
                  className="tuner-slider slider-sage"
                />
              </div>

              {/* Budget Limit Slider */}
              <div className="tuner-control" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <div className="tuner-control-label">
                  <span>Preferred Budget Limit</span>
                  <span className="value">
                    {budgetValue < 2000 ? "Low (< ₹2k)" : budgetValue > 4000 ? "High (> ₹4k)" : "Medium (₹2k-4k)"}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="6000" 
                  step="500"
                  value={budgetValue} 
                  onChange={(e) => setBudgetValue(parseInt(e.target.value))}
                  className="tuner-slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--bg-neutral-muted)', marginTop: '0.15rem' }}>
                  <span>₹1,000</span>
                  <span>₹3,500</span>
                  <span>₹6,000+</span>
                </div>
              </div>

              {/* Availability Preference Grid */}
              <div className="tuner-control" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <span className="tuner-control-label" style={{ marginBottom: '0.25rem' }}>
                  Preferred Availability
                </span>
                <div className="pill-group" style={{ gap: '0.35rem' }}>
                  {['Weekends', 'Weekdays', 'Anytime'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAvailValue(opt)}
                      className={`pill-btn ${availValue === opt ? 'active-sage' : ''}`}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '15px' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Share Portfolio Simulation Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Scout Portfolio Card
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)', textAlign: 'center', marginBottom: '1rem' }}>
              Simulated preview of your City Scout story template ready to share.
            </p>

            {/* Story Card mockup */}
            <div className="story-share-preview">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src={profile.avatar} 
                  alt="Scout Avatar"
                  style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-terracotta)', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--bg-neutral-dark)', fontFamily: 'var(--font-serif)' }}>{profile.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-terracotta)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.badge}</div>
                </div>
              </div>

              <div style={{ margin: '1.5rem 0', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--bg-neutral-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
                  City Impact Metrics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-serif)' }}>
                      {profile.points}p
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--bg-neutral-muted)', textTransform: 'uppercase' }}>
                      Resonance Score
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-sage)', fontFamily: 'var(--font-serif)' }}>
                      {proposals.length}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--bg-neutral-muted)', textTransform: 'uppercase' }}>
                      Active Campaigns
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--bg-neutral-dark)' }}>
                  Rallying Bangalore's Desire
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--bg-neutral-muted)', marginTop: '0.15rem' }}>
                  Join my campaigns at rallence.vercel.app
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={copyShareLink}>
                {copiedLink ? "✓ Portfolio Link Copied" : "Copy Portfolio Link"}
              </button>
              <button className="btn btn-outline" onClick={() => {
                alert("Simulated share to Instagram Stories. Image preview generated!");
                setShowShareModal(false);
              }}>
                Post to Instagram Stories
              </button>
              <button className="btn btn-text" onClick={() => setShowShareModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
