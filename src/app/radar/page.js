"use client";

import { useState, useEffect } from 'react';

export default function ProviderRadar() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProposalId, setExpandedProposalId] = useState(null);

  // Bid Form State
  const [providerName, setProviderName] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedCapacity, setProposedCapacity] = useState('');
  const [proposedTerms, setProposedTerms] = useState('');
  const [agreedToPlaybook, setAgreedToPlaybook] = useState(false);
  const [submittingBidId, setSubmittingBidId] = useState(null);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals?userId=admin');
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleBidSubmit = async (proposalId) => {
    if (!providerName || !proposedPrice || !proposedDate || !proposedCapacity || !proposedTerms || !agreedToPlaybook) {
      alert("Please fill all bid details and check the Event Playbook Agreement checkbox.");
      return;
    }

    setSubmittingBidId(proposalId);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName,
          price: proposedPrice,
          proposedDate,
          capacity: proposedCapacity,
          terms: proposedTerms
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Offer submitted to ${data.proposal.title}! The proposal founder has been notified.`);
        // Reset form
        setProviderName('');
        setProposedPrice('');
        setProposedDate('');
        setProposedCapacity('');
        setProposedTerms('');
        setAgreedToPlaybook(false);
        setExpandedProposalId(null);
        fetchProposals();
      }
    } catch (err) {
      console.error("Bid submission failed:", err);
    } finally {
      setSubmittingBidId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--bg-neutral-muted)' }}>
        Accessing Rallence Provider Radar...
      </div>
    );
  }

  // Calculate aggregate business metrics
  const activeProposals = proposals.filter(p => p.status !== 'ACTIVATED');
  const totalBackers = proposals.reduce((sum, p) => sum + p.supporters.length + (p.supporterCountOffset || 0), 0);
  
  // Calculate total committed value
  const totalCommittedValue = proposals.reduce((sum, p) => {
    const avgWtp = p.supporters.reduce((sSum, s) => sSum + s.willingnessToPay, 0) / (p.supporters.length || 1);
    const count = p.supporters.length + (p.supporterCountOffset || 0);
    return sum + (avgWtp * count);
  }, 0);

  // Hardcode representative WTP curve heights for visual chart
  const getWtpHeights = (propId) => {
    if (propId === 'prop-1') {
      return [
        { price: 6000, count: 8, height: 40 },
        { price: 4800, count: 18, height: 90 },
        { price: 3500, count: 4, height: 20 }
      ];
    }
    if (propId === 'prop-2') {
      return [
        { price: 3500, count: 12, height: 50 },
        { price: 3000, count: 20, height: 85 },
        { price: 2000, count: 4, height: 15 }
      ];
    }
    if (propId === 'prop-4') {
      return [
        { price: 6000, count: 3, height: 25 },
        { price: 5000, count: 8, height: 75 },
        { price: 4000, count: 1, height: 10 }
      ];
    }
    return [
      { price: 4000, count: 5, height: 40 },
      { price: 3000, count: 10, height: 80 },
      { price: 2000, count: 3, height: 25 }
    ];
  };

  return (
    <div className="radar-layout">
      
      {/* Editorial Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>B2B Provider Radar</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--bg-neutral-muted)' }}>
          Review aggregated city-wide demand signals. Pitch terms directly to execute the exact playbooks proposed.
        </p>
      </div>

      {/* High-level Business Metrics Grid */}
      <div className="radar-stats-grid">
        <div className="radar-stat-card">
          <span className="label">Total Committed Volume</span>
          <span className="value">₹{Math.round(totalCommittedValue).toLocaleString()}</span>
        </div>
        <div className="radar-stat-card">
          <span className="label">Active Demand Campaigns</span>
          <span className="value">{activeProposals.length} live</span>
        </div>
        <div className="radar-stat-card">
          <span className="label">Total Voted Backers</span>
          <span className="value">{totalBackers} scouts</span>
        </div>
        <div className="radar-stat-card">
          <span className="label">Conversion Confidence</span>
          <span className="value" style={{ color: 'var(--accent-sage)' }}>94% High</span>
        </div>
      </div>

      {/* Active Demand List */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '1.25rem' }}>
          Active Demand Opportunities
        </h2>

        <div className="radar-proposals-grid">
          {activeProposals.map((prop) => {
            const count = prop.supporters.length + (prop.supporterCountOffset || 0);
            const avgWtp = prop.supporters.reduce((sum, s) => sum + s.willingnessToPay, 0) / (prop.supporters.length || 1);
            const potentialRevenue = avgWtp * count;
            const isExpanded = expandedProposalId === prop.id;

            return (
              <div 
                key={prop.id} 
                className="radar-proposal-row"
                style={{ 
                  flexDirection: 'column', 
                  alignItems: 'stretch', 
                  gap: '1rem',
                  borderColor: isExpanded ? 'var(--accent-terracotta)' : 'var(--border-color)' 
                }}
              >
                {/* Proposal Basic Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="radar-proposal-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge badge-scout">{prop.category}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)' }}>
                        Proposed by {prop.creatorId === 'admin' ? 'Kranti' : 'Ananya'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginTop: '0.25rem' }}>{prop.title}</h3>
                  </div>

                  {/* Pricing metrics */}
                  <div className="radar-proposal-metrics">
                    <div className="radar-metric-item">
                      <span className="lbl">Backers Pool</span>
                      <span className="val">{count} / {prop.targetThreshold}</span>
                    </div>
                    <div className="radar-metric-item">
                      <span className="lbl">Avg. Ticket Cost</span>
                      <span className="val">₹{Math.round(avgWtp).toLocaleString()}</span>
                    </div>
                    <div className="radar-metric-item">
                      <span className="lbl">Revenue Potential</span>
                      <span className="val" style={{ color: 'var(--accent-terracotta)' }}>
                        ₹{Math.round(potentialRevenue).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Bid Details */}
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setExpandedProposalId(isExpanded ? null : prop.id);
                      setAgreedToPlaybook(false);
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {isExpanded ? "Close Radar" : "Analyze & Bid"}
                  </button>
                </div>

                {/* Expanded B2B details & Form */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Left side: WTP Curve & Playbook */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Demand curve bar chart */}
                      <div className="wtp-curve-container">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-serif)' }}>
                          📈 Price Points Demand Curve (Willingness to Pay spread)
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)', marginBottom: '0.5rem' }}>
                          Ticket sales volumes gathered from backer context profiles:
                        </p>
                        
                        <div className="wtp-bars">
                          {getWtpHeights(prop.id).map((column, i) => (
                            <div key={i} className={`wtp-bar-column ${i === 1 ? 'active' : ''}`}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{column.count} tix</span>
                              <div className="wtp-bar-fill" style={{ height: `${column.height}px` }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--bg-neutral-dark)' }}>
                                ₹{column.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Event Playbook spec sheet */}
                      <div className="playbook-card">
                        <h4 className="playbook-header">📖 Proposed Event Playbook spec</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--bg-neutral-muted)', marginBottom: '0.75rem' }}>
                          Your bid is a commitment to execute this exact blueprint proposed by the founder:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                          <div>
                            <strong>Core Concept:</strong> {prop.playbook.concept}
                          </div>
                          <div>
                            <strong>Atmosphere:</strong> {prop.playbook.vibe}
                          </div>
                          <div>
                            <strong>Required Elements:</strong>
                            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                              {prop.playbook.key_requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Scheduling Constraints:</strong> {prop.playbook.conditions}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Bid submission form */}
                    <div style={{ background: 'var(--bg-cream)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--bg-neutral-dark)' }}>
                        Submit Terms to Host
                      </h4>
                      
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Venue/Provider Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Shibui Restaurant Bangalore" 
                          value={providerName}
                          onChange={(e) => setProviderName(e.target.value)}
                          className="form-input"
                          style={{ background: '#fff' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem' }}>Proposed Ticket Cost (₹)</label>
                          <input 
                            type="number" 
                            placeholder="e.g., 4500" 
                            value={proposedPrice}
                            onChange={(e) => setProposedPrice(e.target.value)}
                            className="form-input"
                            style={{ background: '#fff' }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem' }}>Max Capacity (seats)</label>
                          <input 
                            type="number" 
                            placeholder="e.g., 25" 
                            value={proposedCapacity}
                            onChange={(e) => setProposedCapacity(e.target.value)}
                            className="form-input"
                            style={{ background: '#fff' }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Proposed Date & Hour</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Saturday, July 11th, 7:30 PM" 
                          value={proposedDate}
                          onChange={(e) => setProposedDate(e.target.value)}
                          className="form-input"
                          style={{ background: '#fff' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Specific Terms / Offer Package Details</label>
                        <textarea 
                          rows={2} 
                          placeholder="What is included? e.g., 5-course washoku selection, 4 craft sake flights..."
                          value={proposedTerms}
                          onChange={(e) => setProposedTerms(e.target.value)}
                          className="form-input"
                          style={{ background: '#fff', resize: 'vertical' }}
                        />
                      </div>

                      {/* Playbook agreement checkbox */}
                      <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', lineHeight: '1.4', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          checked={agreedToPlaybook}
                          onChange={(e) => setAgreedToPlaybook(e.target.checked)}
                          style={{ marginTop: '2px' }}
                        />
                        <span>
                          I agree to host the event as detailed in the **Event Playbook** blueprint. I confirm that we can guarantee ticket availability at the proposed price point.
                        </span>
                      </label>

                      <button 
                        className="btn btn-primary"
                        onClick={() => handleBidSubmit(prop.id)}
                        disabled={submittingBidId === prop.id}
                        style={{ marginTop: '0.5rem' }}
                      >
                        {submittingBidId === prop.id ? "Submitting Offer..." : "Submit Structured Offer"}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
