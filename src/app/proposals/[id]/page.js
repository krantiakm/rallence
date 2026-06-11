"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

function ProviderLogo({ src, alt }) {
  const [error, setError] = useState(!src);

  if (error) {
    return (
      <div className="provider-logo-fallback">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h18M9 21V9M12 2v7M12 18v3M15 21V9M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z"/>
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="provider-logo-img" 
      onError={() => setError(true)} 
    />
  );
}

export default function ProposalDetail() {
  const params = useParams();
  const id = params.id;
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backing Flow State
  const [showBackingForm, setShowBackingForm] = useState(false);
  const [selectedWTP, setSelectedWTP] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [backingStep, setBackingStep] = useState(1);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch Proposal details
  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${id}`);
      const data = await res.json();
      if (data.success) {
        setProposal(data.proposal);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch proposal details:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  // Handle support submission
  const handleSupportSubmit = async () => {
    if (!selectedWTP || !selectedAvailability) return;
    try {
      const res = await fetch(`/api/proposals/${id}/support`, {
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
        setBackingStep(3);
        fetchProposal();
      }
    } catch (err) {
      console.error("Failed to submit support:", err);
    }
  };

  // Vote on a provider bid
  const handleVoteBid = async (bidId) => {
    try {
      const res = await fetch(`/api/proposals/${id}/bids`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId,
          userId: 'admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProposal();
      }
    } catch (err) {
      console.error("Failed to vote on bid:", err);
    }
  };

  // Accept provider bid & activate experience
  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId,
          userId: 'admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Experience Activated! Indiranagar Social has been selected as the host venue.");
        fetchProposal();
      }
    } catch (err) {
      console.error("Failed to accept bid:", err);
    }
  };

  const copyShareLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      
      // Simulate invite points increment
      await fetch(`/api/proposals/${id}/bids?userId=admin&count=5`, { method: 'PUT' });
      fetchProposal();
      
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--bg-neutral-muted)' }}>
        Loading experience details...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--accent-terracotta)' }}>
        Proposal not found.
      </div>
    );
  }

  const supportedCount = proposal.supporters.length + (proposal.supporterCountOffset || 0);
  const percentage = Math.min(Math.round((supportedCount / proposal.targetThreshold) * 100), 100);
  const isBackedByMe = proposal.supporters.some(s => s.userId === 'admin');
  const isActivated = proposal.status === 'ACTIVATED';

  // Availability preference stats
  const availabilities = proposal.supporters.map(s => s.availability);
  const preferredWeekendCount = availabilities.filter(a => a?.includes('Weekend')).length + (proposal.id === 'prop-1' ? 22 : proposal.id === 'prop-2' ? 28 : 12);
  const totalVotes = supportedCount;
  const weekendPercentage = Math.round((preferredWeekendCount / (totalVotes || 1)) * 100);

  // WTP options
  const wtpOptions = proposal.category === 'Food' ? [3500, 4800, 6000] : proposal.category === 'Performance' ? [1500, 2500, 3500] : [2000, 3500, 5000];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back to feed link */}
      <div>
        <a href="/" style={{ fontSize: '0.9rem', color: 'var(--accent-terracotta)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span className="icon-inline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </span>
          ← Explore Experiences
        </a>
      </div>

      {/* Header card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-scout">{proposal.category}</span>
          <span className={`badge ${isActivated ? 'badge-founder' : 'badge-backer'}`}>
            {proposal.status.replace('_', ' ')}
          </span>
        </div>
        <h1 className="proposal-detail-title">{proposal.title}</h1>
        
        {/* Creator Info */}
        <div className="creator-info-row">
          <img 
            src={proposal.creatorId === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
            alt="Creator" 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div>
            <div style={{ fontWeight: '700' }}>
              {proposal.creatorId === 'admin' ? 'Proposed by me' : `Proposed by ${proposal.creatorId === 'user_2' ? 'Ananya' : proposal.creatorId === 'user_1' ? 'Aarav' : 'Vikram'}`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)' }}>City Scout · Bangalore</div>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowShareModal(true)}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span className="icon-inline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            Share Proposal
          </button>
        </div>
      </div>

      {/* Hero Visual */}
      <div className="detail-hero-container">
        <img src={proposal.image} alt={proposal.title} className="detail-hero-image" />
      </div>

      {/* Grid: Description & Playbook */}
      <div className="details-layout-grid">
        {/* Left Column: Description & Backing stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>The Vision</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--bg-neutral-muted)' }}>
              {proposal.description}
            </p>
          </div>

          {/* Demand metrics */}
          <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-organic)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Demand Insights</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  <span>Rally Target</span>
                  <span>{supportedCount} / {proposal.targetThreshold} Backers ({percentage}%)</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar-fill ${isActivated ? 'activated' : ''}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)' }}>PCP Availability</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-sage)' }}>{weekendPercentage}% Weekends</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)' }}>Average Budget</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-terracotta)' }}>
                    ₹{(proposal.supporters.reduce((sum, s) => sum + s.willingnessToPay, 0) / (proposal.supporters.length || 1)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Event Playbook Spec Sheet */}
        <div>
          <div className="playbook-card" style={{ sticky: 'top', background: 'var(--accent-sage-light)' }}>
            <div className="playbook-header" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="icon-inline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
              </span>
              Event Playbook spec
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
              These are the non-negotiable standards defined by the founder. Venues must follow this blueprint:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-sage-hover)' }}>Core Concept</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-dark)', marginTop: '0.15rem' }}>{proposal.playbook.concept}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-sage-hover)' }}>Vibe & Tone</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-dark)', marginTop: '0.15rem' }}>{proposal.playbook.vibe}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-sage-hover)' }}>Required Details</h4>
                <ul className="playbook-list" style={{ marginTop: '0.25rem' }}>
                  {proposal.playbook.key_requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-sage-hover)' }}>Constraints & Date</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-dark)', marginTop: '0.15rem' }}>{proposal.playbook.conditions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rally backing component */}
      {!isActivated && (
        <div className="backing-box">
          {isBackedByMe ? (
            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-sage)', marginBottom: '0.5rem' }}>✓</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>You have rallied for this</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--bg-neutral-muted)' }}>
                Your availability and willingness-to-pay are on the demand radar. We'll notify you as soon as provider terms are accepted!
              </p>
            </div>
          ) : showBackingForm ? (
            <div className="backing-panel" style={{ maxWidth: '500px', margin: '0 auto', border: 'none', boxShadow: 'none' }}>
              {backingStep === 1 && (
                <>
                  <div className="backing-step-title" style={{ fontSize: '1.4rem' }}>How much would you pay for this?</div>
                  <div className="pill-group" style={{ justifyContent: 'center', margin: '1rem 0' }}>
                    {wtpOptions.map((price) => (
                      <button 
                        key={price}
                        className={`pill-btn ${selectedWTP === price ? 'active' : ''}`}
                        onClick={() => setSelectedWTP(price)}
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                      >
                        ₹{price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn btn-text" onClick={() => setShowBackingForm(false)}>Cancel</button>
                    <button 
                      className="btn btn-primary" 
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
                  <div className="backing-step-title" style={{ fontSize: '1.4rem' }}>When are you available?</div>
                  <div className="pill-group" style={{ justifyContent: 'center', margin: '1rem 0' }}>
                    {['This Weekend', 'Any Weekend', 'Weekdays', 'Anytime'].map((time) => (
                      <button 
                        key={time}
                        className={`pill-btn ${selectedAvailability === time ? 'active-sage' : ''}`}
                        onClick={() => setSelectedAvailability(time)}
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn btn-text" onClick={() => setBackingStep(1)}>Back</button>
                    <button 
                      className="btn btn-secondary" 
                      disabled={!selectedAvailability}
                      onClick={handleSupportSubmit}
                    >
                      Commit Interest
                    </button>
                  </div>
                </>
              )}

              {backingStep === 3 && (
                <div className="backing-success-animation">
                  <div className="checkmark-circle">✓</div>
                  <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>Resonance Locked In!</div>
                  <p style={{ fontSize: '0.9rem', color: '#5C5A57' }}>
                    Your details are submitted. We added +10 Scout points to your profile.
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setShowBackingForm(false);
                      setBackingStep(1);
                    }}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)' }}>Rally Around This Experience</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--bg-neutral-muted)', maxWidth: '500px' }}>
                Join the demand pool! Once we reach the target threshold, curated venues will submit structured dates and pricing to host this exact blueprint.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setSelectedWTP(null);
                  setSelectedAvailability(null);
                  setBackingStep(1);
                  setShowBackingForm(true);
                }}
                style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
              >
                Rally Interest
              </button>
            </div>
          )}
        </div>
      )}

      {/* Provider Bids section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
          Provider Bids & Offers
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--bg-neutral-muted)', marginBottom: '1.5rem' }}>
          Top vetted venues listening on the Rallence Radar have submitted these bids to execute the playbook above.
        </p>

        {proposal.bids.length === 0 ? (
          <div style={{ background: 'var(--bg-paper)', border: '1px dashed var(--border-color)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--bg-neutral-muted)' }}>
            📡 Providers are analyzing the demand data on their radar. Offers will appear as we cross the threshold.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {proposal.bids.map((bid) => {
              const isAccepted = proposal.activeBidId === bid.id;
              const hasVoted = bid.votes.includes('admin');
              return (
                <div 
                  key={bid.id} 
                  className={`provider-bid-card ${isAccepted ? 'accepted' : ''}`}
                >
                  {isAccepted && (
                    <span className="badge badge-founder selected-badge">
                      SELECTED & ACTIVATED
                    </span>
                  )}
                  
                  <ProviderLogo src={bid.providerLogo} alt={bid.providerName} />
                  
                  <div className="provider-bid-content">
                    <div className="bid-header-row">
                      <div className="bid-provider-info">
                        <h3 className="bid-provider-name">{bid.providerName}</h3>
                        <p className="bid-provider-meta">
                          Proposed Date: <strong>{bid.proposedDate}</strong> · Capacity: <strong>{bid.capacity} seats</strong>
                        </p>
                      </div>
                      <div className="bid-price-badge">
                        <span className="bid-price-value">₹{bid.price.toLocaleString()}</span>
                        <span className="bid-price-label"> / head</span>
                      </div>
                    </div>
                    
                    <p className="bid-terms">
                      {bid.terms}
                    </p>
                    
                    <div className="bid-footer-row">
                      {/* Backer Votes */}
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleVoteBid(bid.id)}
                        style={{ 
                          background: hasVoted ? 'var(--accent-terracotta-light)' : 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        disabled={isActivated}
                      >
                        <span className="icon-inline">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        </span>
                        Vote Preference ({bid.votes.length})
                      </button>

                      {/* Accept Offer Action (Available to Creator/Admin) */}
                      {!isActivated && (proposal.creatorId === 'admin' || 'admin' === 'admin') && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAcceptBid(bid.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          Accept & Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal overlay */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
              Share Proposal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--bg-neutral-muted)' }}>
              Invite friends to back this campaign! Each signup increases our resonance score and attracts top venues.
            </p>

            <div className="share-preview-card">
              <img 
                src={proposal.creatorId === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                alt="Proposer"
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-terracotta)', objectFit: 'cover' }}
              />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--bg-neutral-dark)' }}>
                {proposal.title}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-terracotta)', fontWeight: '600', marginTop: '0.25rem' }}>
                Join me to unlock the target threshold!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={copyShareLink}>
                {copiedLink ? "✓ Link Copied" : "Copy Invite Link (+5 Scout pts)"}
              </button>
              <button className="btn btn-outline" onClick={() => {
                alert("Simulating share to Instagram Stories. Image preview generated!");
                setShowShareModal(false);
              }}>
                Share to Instagram Story
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
