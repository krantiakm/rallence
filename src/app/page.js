"use client";

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [backingProposalId, setBackingProposalId] = useState(null);
  
  // Backing Flow State
  const [backingStep, setBackingStep] = useState(1); // 1: WTP, 2: Availability, 3: Success
  const [selectedWTP, setSelectedWTP] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  
  // Share Modal State
  const [sharingProposal, setSharingProposal] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const feedRef = useRef(null);

  // Fetch proposals on load
  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals?userId=admin');
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Track active card on scroll snapping
  const handleScroll = () => {
    if (!feedRef.current) return;
    const scrollTop = feedRef.current.scrollTop;
    const cardHeight = feedRef.current.clientHeight;
    const index = Math.round(scrollTop / cardHeight);
    if (index !== activeCardIndex && index >= 0 && index < proposals.length) {
      setActiveCardIndex(index);
      setBackingProposalId(null); // Reset backing panel if swiped away
    }
  };

  // Handle Rally Form Submit
  const handleRallySubmit = async (proposalId) => {
    if (!selectedWTP || !selectedAvailability) return;
    
    try {
      const res = await fetch(`/api/proposals/${proposalId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin',
          willingnessToPay: selectedWTP,
          availability: selectedAvailability
        })
      });
      const data = await res.json();
      if (data.success) {
        setBackingStep(3); // success
        // Refresh proposal list to get updated count and progress
        fetchProposals();
      }
    } catch (err) {
      console.error("Backing failed:", err);
    }
  };

  // Handle Share invite click
  const handleShareClick = (proposal) => {
    setSharingProposal(proposal);
    setCopiedLink(false);
  };

  const copyShareLink = async (proposal) => {
    const link = `${window.location.origin}/proposals/${proposal.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      
      // Simulate invite points increment
      await fetch(`/api/proposals/${proposal.id}/bids?userId=admin&count=5`, { method: 'PUT' });
      fetchProposals();
      
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const getWtpOptions = (category) => {
    if (category === 'Food') return [3500, 4800, 6000];
    if (category === 'Performance') return [1500, 2500, 3500];
    if (category === 'Social') return [2000, 3500, 5000];
    return [2500, 4500, 6000];
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className={`onboarding-overlay`}>
          <div className="onboarding-card">
            <h1 className="onboarding-title">Rallence</h1>
            <p className="onboarding-tagline">What should happen next in your city?</p>
            <p className="onboarding-desc">
              Rallence is where the city's most unique, unmissable experiences begin. 
              <br /><br />
              We bring people together to <em>rally</em> around ideas they wish existed, creating a <em>resonance</em> that top chefs, artists, and venues can't ignore. Support a concept, specify your budget, and help bring it to life.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowOnboarding(false)}
              style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem', letterSpacing: '0.01em' }}
            >
              Explore Proposals
            </button>
          </div>
        </div>
      )}

      {/* Main Instagram snappable layout */}
      <div className="instagram-feed-container">
        <div 
          className="feed-scroller" 
          ref={feedRef}
          onScroll={handleScroll}
        >
          {proposals.length === 0 ? (
            <div style={{ color: '#fff', padding: '2rem', textAlign: 'center', marginTop: '40%' }}>
              <p>Gathering fresh city proposals...</p>
            </div>
          ) : (
            proposals.map((prop, idx) => {
              const supportedCount = prop.supporters.length + (prop.supporterCountOffset || 0);
              const percentage = Math.min(Math.round((supportedCount / prop.targetThreshold) * 100), 100);
              const isBackedByMe = prop.supporters.some(s => s.userId === 'admin');
              const isActivated = prop.status === 'ACTIVATED';

              return (
                <div className="instagram-card" key={prop.id}>
                  {/* Backdrop Visual */}
                  <div className="card-background-media">
                    <img src={prop.image} alt={prop.title} className="card-image-sim" />
                    <div className="card-gradient-overlay" />
                  </div>

                  {/* Card Content Layer */}
                  <div className="card-content">
                    {/* Proposer Info */}
                    <div className="card-founder-tag">
                      <img 
                        src={prop.creatorId === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                        alt="Creator" 
                        className="founder-avatar" 
                      />
                      <div className="founder-info">
                        <span className="founder-name">
                          {prop.creatorId === 'admin' ? 'Proposed by me' : `Proposed by ${prop.creatorId === 'user_2' ? 'Ananya' : prop.creatorId === 'user_1' ? 'Aarav' : 'Vikram'}`}
                        </span>
                        <span className="founder-title">City Scout · Bangalore</span>
                      </div>
                      <span className="badge badge-scout" style={{ marginLeft: 'auto' }}>
                        {prop.category}
                      </span>
                    </div>

                    {/* Proposal Texts */}
                    <div>
                      <h2 className="card-title">{prop.title}</h2>
                      <p className="card-description" style={{ marginTop: '0.5rem' }}>
                        {prop.description}
                      </p>
                    </div>

                    {/* Structured Playbook Summary (Brief snippet for preview) */}
                    <div className="playbook-card" style={{ background: 'rgba(110, 138, 117, 0.15)', borderColor: 'rgba(110, 138, 117, 0.3)', color: '#fff', padding: '0.85rem' }}>
                      <div className="playbook-header" style={{ color: '#A1C0AA', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        📖 Event Playbook Vibe: {prop.playbook.vibe}
                      </div>
                      <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', opacity: 0.9 }}>
                        {prop.playbook.key_requirements.slice(0, 2).map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress indicator */}
                    <div className="card-progress-section">
                      <div className="progress-label-bar">
                        <span>{isActivated ? 'Experience Activated!' : 'Rally Progress'}</span>
                        <span>{supportedCount} / {prop.targetThreshold} Backers ({percentage}%)</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar-fill ${isActivated ? 'activated' : ''}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons or In-context backing overlay */}
                    {backingProposalId === prop.id ? (
                      <div className="backing-panel">
                        {backingStep === 1 && (
                          <>
                            <div className="backing-step-title">How much would you pay for this?</div>
                            <div className="pill-group">
                              {getWtpOptions(prop.category).map((price) => (
                                <button 
                                  key={price}
                                  className={`pill-btn ${selectedWTP === price ? 'active' : ''}`}
                                  onClick={() => setSelectedWTP(price)}
                                >
                                  ₹{price.toLocaleString()}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button className="btn btn-text" onClick={() => setBackingProposalId(null)}>Cancel</button>
                              <button 
                                className="btn btn-primary" 
                                style={{ marginLeft: 'auto' }}
                                disabled={!selectedWTP}
                                onClick={() => setBackingStep(2)}
                              >
                                Next
                              </button>
                            </div>
                          </>
                        )}

                        {backingStep === 2 && (
                          <>
                            <div className="backing-step-title">When are you available?</div>
                            <div className="pill-group">
                              {['This Weekend', 'Any Weekend', 'Weekdays', 'Anytime'].map((time) => (
                                <button 
                                  key={time}
                                  className={`pill-btn ${selectedAvailability === time ? 'active-sage' : ''}`}
                                  onClick={() => setSelectedAvailability(time)}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button className="btn btn-text" onClick={() => setBackingStep(1)}>Back</button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ marginLeft: 'auto' }}
                                disabled={!selectedAvailability}
                                onClick={() => handleRallySubmit(prop.id)}
                              >
                                Commit Interest
                              </button>
                            </div>
                          </>
                        )}

                        {backingStep === 3 && (
                          <div className="backing-success-animation">
                            <div className="checkmark-circle">✓</div>
                            <div style={{ fontWeight: '600' }}>Resonance Locked In!</div>
                            <p style={{ fontSize: '0.85rem', color: '#5C5A57' }}>
                              Your WTP of ₹{selectedWTP?.toLocaleString()} and availability ({selectedAvailability}) have been structured into the demand radar.
                            </p>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => {
                                setBackingProposalId(null);
                                setBackingStep(1);
                              }}
                              style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                              Awesome
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="card-actions-row">
                        {isBackedByMe ? (
                          <button className="btn btn-secondary" style={{ flex: 1, cursor: 'default' }} disabled>
                            ✓ Rallied
                          </button>
                        ) : isActivated ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ flex: 1 }}
                            onClick={() => window.location.href = `/proposals/${prop.id}`}
                          >
                            View Details (Activated)
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1 }}
                            onClick={() => {
                              setSelectedWTP(null);
                              setSelectedAvailability(null);
                              setBackingStep(1);
                              setBackingProposalId(prop.id);
                            }}
                          >
                            Rally Interest
                          </button>
                        )}

                        <button 
                          className="btn btn-outline" 
                          style={{ borderColor: '#fff', color: '#fff', padding: '0.75rem' }}
                          onClick={() => handleShareClick(prop)}
                        >
                          🔗 Share
                        </button>
                        
                        <a 
                          href={`/proposals/${prop.id}`} 
                          className="btn" 
                          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem' }}
                        >
                          👁️ Details
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vertical Swipe Navigation Helper */}
        <div className="feed-nav-instructions">
          {proposals.map((_, idx) => (
            <div 
              key={idx} 
              className={`feed-nav-dot ${idx === activeCardIndex ? 'active' : ''}`}
              onClick={() => {
                if (feedRef.current) {
                  const cardHeight = feedRef.current.clientHeight;
                  feedRef.current.scrollTo({
                    top: idx * cardHeight,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Share Modal overlay */}
      {sharingProposal && (
        <div className="modal-overlay" onClick={() => setSharingProposal(null)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
              Share Proposal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-muted)' }}>
              Invite friends to back this campaign! Each signup increases our resonance score and attracts top venues.
            </p>

            <div className="share-preview-card">
              <img 
                src={sharingProposal.creatorId === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                alt="Proposer"
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-terracotta)', objectFit: 'cover' }}
              />
              <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '0.5rem', color: 'var(--bg-neutral-dark)' }}>
                {sharingProposal.title}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-terracotta)', fontWeight: '600', marginTop: '0.25rem' }}>
                Join me to unlock the target threshold!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => copyShareLink(sharingProposal)}>
                {copiedLink ? "✓ Link Copied" : "Copy Invite Link (+5 Scout pts)"}
              </button>
              <button className="btn btn-outline" onClick={() => {
                alert("Simulating share to Instagram Stories. Image preview generated!");
                setSharingProposal(null);
              }}>
                Share to Instagram Story
              </button>
              <button className="btn btn-text" onClick={() => setSharingProposal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
