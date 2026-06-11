"use client";

import { useState, useEffect, useRef } from 'react';

const getWtpBounds = (category) => {
  if (category === 'Food') return { min: 2000, max: 7000, defaultVal: 4500, step: 250 };
  if (category === 'Performance') return { min: 1000, max: 4000, defaultVal: 2500, step: 100 };
  if (category === 'Social') return { min: 1500, max: 5000, defaultVal: 3000, step: 250 };
  if (category === 'Outdoors') return { min: 2000, max: 6000, defaultVal: 4000, step: 200 };
  return { min: 2000, max: 6000, defaultVal: 3500, step: 200 };
};

const getWtpDescription = (category, value) => {
  const val = parseInt(value) || 0;
  if (category === 'Food') {
    if (val < 3500) return "Basic Cafe / Self-Serve: Shared long table, simple bites, standard ambient cafe acoustics.";
    if (val < 5500) return "Premium Bistro / Lounge: 4-course curated menu, dedicated waitstaff, customized acoustics.";
    return "Luxury Counter / Private Dining: 6-course seasonal Washoku menu, premium sake pairings, quiet solid wood acoustics.";
  }
  if (category === 'Performance') {
    if (val < 1800) return "Standing Room / Backyard Garden: standard acoustics, basic welcome beverage.";
    if (val < 2800) return "Seated Terrace / Jazz Lounge: dedicated chairs, 2-pour wine flight, sound-tuned spacing.";
    return "Audiophile Room / Private Balcony: premium front-row acoustic seating, custom charcuterie, 4-pour tasting flight.";
  }
  if (category === 'Social') {
    if (val < 2500) return "Shared Lounge: Casual couch seating, basic appetizer platters, ambient background noise.";
    if (val < 3800) return "Private Library / Green Room: Dedicated discussion space, multi-course healthy dinner, low-noise private acoustics.";
    return "Skyline Loft Buyout: Premium top-floor buyout, bespoke chef dining, pre-circulated readings, fully private.";
  }
  // Outdoors
  if (val < 3500) return "Basic Field Camp: Standard tents, BYO gear option, simple bonfire, shared field kitchen.";
  if (val < 4800) return "Premium Glamping: High-quality weather-proof tents, guide-led telescope session, farm-to-table organic meals.";
  return "Luxury Wilderness Dome: Geodesic domes with private decks, specialized astronomer guides, premium stargazing equipment, forest banquet.";
};

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [backingProposalId, setBackingProposalId] = useState(null);
  
  // Backing Flow State
  const [backingStep, setBackingStep] = useState(1); // 1: WTP, 2: Availability, 3: Success
  const [selectedWTP, setSelectedWTP] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);

  // Booking Flow State
  const [bookingActiveProposalId, setBookingActiveProposalId] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Seats, 2: Notes & Checkout, 3: Success Ticket
  const [bookingSeats, setBookingSeats] = useState(1);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  
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
      setBookingActiveProposalId(null); // Reset booking panel too
    }
  };

  // Handle Rally Form Submit
  const handleRallySubmit = async (proposalId) => {
    const finalWTP = selectedWTP || getWtpBounds(proposals.find(p => p.id === proposalId)?.category).defaultVal;
    if (!selectedAvailability) return;
    
    try {
      const res = await fetch(`/api/proposals/${proposalId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin',
          willingnessToPay: finalWTP,
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

  // Handle Ticket Booking Submit
  const handleBookSubmit = async (proposalId) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin',
          seatsCount: bookingSeats,
          notes: bookingNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingResult({ booking: data.booking, proposal: data.proposal });
        setBookingStep(3); // ticket display
        // Refresh proposal list
        fetchProposals();
      } else {
        alert("Booking failed: " + data.error);
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed due to an error.");
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

                    {/* Action buttons or In-context backing/booking overlay */}
                    {bookingActiveProposalId === prop.id ? (
                      <div className="backing-panel">
                        {bookingStep === 1 && (
                          <>
                            <div className="backing-step-title" style={{ color: 'var(--accent-terracotta)', fontWeight: '700' }}>Select Seats</div>
                            <div style={{ fontSize: '0.8rem', color: '#8F8D8A', marginBottom: '0.75rem' }}>
                              Price: ₹{prop.bids.find(b => b.id === prop.activeBidId)?.price?.toLocaleString() || '3,500'} / seat
                            </div>
                            <div className="pill-group" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {[1, 2, 4, 8].map((seats) => (
                                <button 
                                  key={seats}
                                  className={`pill-btn ${bookingSeats === seats ? 'active' : ''}`}
                                  onClick={() => setBookingSeats(seats)}
                                  style={{ flex: 1, minWidth: '50px', padding: '0.5rem 0.25rem', fontSize: '0.8rem' }}
                                >
                                  {seats} {seats === 1 ? 'Seat' : 'Seats'}
                                </button>
                              ))}
                            </div>
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#8F8D8A', display: 'block' }}>Total Amount:</span>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--bg-neutral-dark)' }}>
                                  ₹{(bookingSeats * (prop.bids.find(b => b.id === prop.activeBidId)?.price || 3500)).toLocaleString()}
                                </strong>
                              </div>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button className="btn btn-text" onClick={() => setBookingActiveProposalId(null)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Cancel</button>
                                <button 
                                  className="btn btn-primary" 
                                  onClick={() => setBookingStep(2)}
                                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {bookingStep === 2 && (
                          <>
                            <div className="backing-step-title" style={{ color: 'var(--accent-terracotta)', fontWeight: '700' }}>Notes & Checkout</div>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.75rem', color: '#8F8D8A', display: 'block', marginBottom: '0.2' }}>
                                Dietary/Acoustic constraints:
                              </label>
                              <textarea 
                                className="form-input"
                                value={bookingNotes}
                                onChange={(e) => setBookingNotes(e.target.value)}
                                placeholder="E.g., vegetarian, quiet seat request"
                                style={{ width: '100%', minHeight: '45px', padding: '0.4rem', fontSize: '0.8rem', background: '#FFFDF9', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'none', color: '#000' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                              <button className="btn btn-text" onClick={() => setBookingStep(1)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Back</button>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleBookSubmit(prop.id)}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                              >
                                Book Now
                              </button>
                            </div>
                          </>
                        )}

                        {bookingStep === 3 && bookingResult && (
                          <div className="backing-success-animation" style={{ padding: '0.15rem 0' }}>
                            <div style={{ 
                              background: '#FFFDF9',
                              border: '1.5px solid #E5E0D8',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              color: '#1C1917',
                              textAlign: 'left',
                              fontSize: '0.8rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-terracotta)', fontWeight: '700' }}>
                                    Experience Pass
                                  </div>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', margin: '0.1rem 0', fontFamily: 'var(--font-serif)' }}>{prop.title}</h4>
                                </div>
                                
                                {/* CSS procedural QR code */}
                                <div className="ticket-qr-grid" style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(6, 1fr)',
                                  gap: '1.5px',
                                  width: '36px',
                                  height: '36px',
                                  background: '#fff',
                                  padding: '2px',
                                  borderRadius: '2px',
                                  border: '1px solid #E5E0D8'
                                }}>
                                  {[...Array(36)].map((_, i) => {
                                    const row = Math.floor(i / 6);
                                    const col = i % 6;
                                    const isMarker = (row < 2 && col < 2) || (row < 2 && col >= 4) || (row >= 4 && col < 2);
                                    const filled = isMarker || (Math.sin(i * 17) > 0);
                                    return (
                                      <div key={i} style={{
                                        background: filled ? '#1C1917' : 'transparent',
                                        borderRadius: '0.3px'
                                      }} />
                                    );
                                  })}
                                </div>
                              </div>

                              <div style={{ borderBottom: '1px dashed #E5E0D8', margin: '0.5rem 0' }} />

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.7rem' }}>
                                <div>
                                  <span style={{ color: '#8F8D8A', display: 'block', fontSize: '0.55rem' }}>VENUE</span>
                                  <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookingResult.booking.providerName}</strong>
                                </div>
                                <div>
                                  <span style={{ color: '#8F8D8A', display: 'block', fontSize: '0.55rem' }}>DATE / TIME</span>
                                  <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookingResult.booking.proposedDate}</strong>
                                </div>
                                <div>
                                  <span style={{ color: '#8F8D8A', display: 'block', fontSize: '0.55rem' }}>SEATS</span>
                                  <strong>{bookingResult.booking.seatsCount} Person(s)</strong>
                                </div>
                                <div>
                                  <span style={{ color: '#8F8D8A', display: 'block', fontSize: '0.55rem' }}>TICKET ID</span>
                                  <strong>{bookingResult.booking.bookingId}</strong>
                                </div>
                              </div>
                            </div>
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                setBookingActiveProposalId(null);
                                setBookingStep(1);
                                setBookingResult(null);
                              }}
                              style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem 0', fontSize: '0.8rem' }}
                            >
                              Done (+50 Scout pts!)
                            </button>
                          </div>
                        )}
                      </div>
                    ) : backingProposalId === prop.id ? (
                      <div className="backing-panel">
                        {backingStep === 1 && (
                          <>
                            <div className="backing-step-title" style={{ marginBottom: '0.25rem' }}>How much would you pay?</div>
                            
                            {/* Range Slider for WTP */}
                            <div style={{ padding: '0.25rem 0 0.5rem 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-terracotta)', marginBottom: '0.25rem' }}>
                                <span>₹{(selectedWTP || getWtpBounds(prop.category).defaultVal).toLocaleString()}</span>
                                <span style={{ fontSize: '0.75rem', color: '#8F8D8A', alignSelf: 'center', fontWeight: 'normal' }}>
                                  Max: ₹{getWtpBounds(prop.category).max.toLocaleString()}
                                </span>
                              </div>
                              <input 
                                type="range"
                                min={getWtpBounds(prop.category).min}
                                max={getWtpBounds(prop.category).max}
                                step={getWtpBounds(prop.category).step}
                                value={selectedWTP || getWtpBounds(prop.category).defaultVal}
                                onChange={(e) => setSelectedWTP(parseInt(e.target.value))}
                                style={{
                                  width: '100%',
                                  accentColor: 'var(--accent-terracotta)',
                                  background: '#E5E0D8',
                                  height: '5px',
                                  borderRadius: '3px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  margin: '0.25rem 0'
                                }}
                              />
                              
                              {/* Dynamic Tradeoff Board */}
                              <div className="playbook-card" style={{
                                background: 'rgba(28, 25, 23, 0.04)',
                                border: '1px solid rgba(28, 25, 23, 0.08)',
                                color: '#1C1917',
                                padding: '0.5rem 0.6rem',
                                marginTop: '0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                lineHeight: '1.3'
                              }}>
                                <span style={{ color: 'var(--accent-sage-hover)', fontWeight: '700', display: 'block', marginBottom: '0.15rem' }}>
                                  🔓 Venue/Service Level:
                                </span>
                                {getWtpDescription(prop.category, selectedWTP || getWtpBounds(prop.category).defaultVal)}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <button className="btn btn-text" onClick={() => setBackingProposalId(null)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Cancel</button>
                              <button 
                                className="btn btn-primary" 
                                style={{ marginLeft: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                onClick={() => {
                                  if (!selectedWTP) {
                                    setSelectedWTP(getWtpBounds(prop.category).defaultVal);
                                  }
                                  setBackingStep(2);
                                }}
                              >
                                Next
                              </button>
                            </div>
                          </>
                        )}

                        {backingStep === 2 && (
                          <>
                            <div className="backing-step-title">When are you available?</div>
                            <div className="pill-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                              {['This Weekend', 'Any Weekend', 'Weekdays', 'Anytime'].map((time) => (
                                <button 
                                  key={time}
                                  className={`pill-btn ${selectedAvailability === time ? 'active-sage' : ''}`}
                                  onClick={() => setSelectedAvailability(time)}
                                  style={{ padding: '0.4rem 0', fontSize: '0.75rem' }}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button className="btn btn-text" onClick={() => setBackingStep(1)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Back</button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ marginLeft: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
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
                              Details structured into the demand radar (+10 Scout pts!).
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
                        {isActivated ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, background: 'var(--accent-terracotta)', borderColor: 'var(--accent-terracotta)' }}
                            onClick={() => {
                              setBookingSeats(1);
                              setBookingNotes("");
                              setBookingStep(1);
                              setBookingResult(null);
                              setBookingActiveProposalId(prop.id);
                            }}
                          >
                            <span className="icon-inline" style={{ marginRight: '0.35rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </span>
                            Book Tickets
                          </button>
                        ) : isBackedByMe ? (
                          <button className="btn btn-secondary" style={{ flex: 1, cursor: 'default' }} disabled>
                            <span className="icon-inline" style={{ marginRight: '0.35rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </span>
                            Rallied
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1 }}
                            onClick={() => {
                              setSelectedWTP(getWtpBounds(prop.category).defaultVal);
                              setSelectedAvailability(null);
                              setBackingStep(1);
                              setBackingProposalId(prop.id);
                            }}
                          >
                            <span className="icon-inline" style={{ marginRight: '0.35rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                            </span>
                            Rally Interest
                          </button>
                        )}

                        <button 
                          className="btn btn-outline" 
                          style={{ borderColor: '#fff', color: '#fff', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => handleShareClick(prop)}
                          title="Share Campaign"
                        >
                          <span className="icon-inline">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          </span>
                        </button>
                        
                        <a 
                          href={`/proposals/${prop.id}`} 
                          className="btn" 
                          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details"
                        >
                          <span className="icon-inline">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </span>
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
