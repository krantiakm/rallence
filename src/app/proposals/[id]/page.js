"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
        <a href="/" style={{ fontSize: '0.9rem', color: 'var(--accent-terracotta)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          ← Back to Instagram Feed
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
        <h1 style={{ fontSize: '2.75rem', fontWeight: '700', lineHeight: '1.2' }}>{proposal.title}</h1>
        
        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
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
            style={{ marginLeft: 'auto' }}
          >
            🔗 Share Proposal
          </button>
        </div>
      </div>

      {/* Hero Visual */}
      <div style={{ width: '100%', height: '360px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
        <img src={proposal.image} alt={proposal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Grid: Description & Playbook */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', marginTop: '1rem' }}>
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
            <div className="playbook-header">
              📖 Event Playbook spec
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
        <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginTop: '1rem', textAlign: 'center', boxShadow: 'var(--shadow-organic)' }}>
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
                  style={{ 
                    background: 'var(--bg-paper)', 
                    border: isAccepted ? '2px solid var(--accent-sage)' : '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-organic)',
                    position: 'relative'
                  }}
                >
                  {isAccepted && (
                    <span style={{ position: 'absolute', top: '-12px', right: '1.5rem', background: 'var(--accent-sage)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                      SELECTED & ACTIVATED
                    </span>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <img src={bid.providerLogo} alt={bid.providerName} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{bid.providerName}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)', marginTop: '0.15rem' }}>
                        Proposed Date: <strong>{bid.proposedDate}</strong> · Capacity: <strong>{bid.capacity} seats</strong>
                      </p>
                      
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: '0.75rem 0', color: 'var(--bg-neutral-muted)' }}>
                        {bid.terms}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-terracotta)' }}>
                            ₹{bid.price.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)' }}> / head</span>
                        </div>

                        {/* Backer Votes */}
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleVoteBid(bid.id)}
                          style={{ 
                            marginLeft: 'auto', 
                            padding: '0.4rem 0.85rem', 
                            fontSize: '0.85rem',
                            background: hasVoted ? 'var(--accent-terracotta-light)' : 'transparent' 
                          }}
                          disabled={isActivated}
                        >
                          👍 Vote Preference ({bid.votes.length})
                        </button>

                        {/* Accept Offer Action (Available to Creator/Admin) */}
                        {!isActivated && (proposal.creatorId === 'admin' || 'admin' === 'admin') && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleAcceptBid(bid.id)}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                          >
                            Accept & Activate
                          </button>
                        )}
                      </div>
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
