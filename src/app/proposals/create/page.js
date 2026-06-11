"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INSPIRATION_TEMPLATES = [
  {
    title: "Secret Japanese Tasting Menu",
    category: "Food",
    description: "An intimate washoku dinner prepared by a guest chef, paired with four custom sakes sourced from small Niigata breweries. Dine around a single counter table with direct chef interactions.",
    estimatedCost: 4500,
    targetThreshold: 30,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
    playbook_concept: "Communal tasting menu with guest chef.",
    playbook_vibe: "Quiet, sensorial, authentic",
    playbook_requirements: "Communal counter seating, 5-course washoku, sommelier paired sakes",
    playbook_conditions: "Friday/Saturday sunset hours."
  },
  {
    title: "Rooftop Chamber Orchestra",
    category: "Performance",
    description: "A sunset concert featuring a local string quartet playing classical and modern hits on a quiet penthouse terrace. Small grazing boards and a flight of organic natural wines included.",
    estimatedCost: 2800,
    targetThreshold: 60,
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
    playbook_concept: "Outdoor terrace acoustic sunset music concert.",
    playbook_vibe: "Elegant, breezy, conversational",
    playbook_requirements: "Open terrace, acoustic string quartet, 3-pour wine flight",
    playbook_conditions: "Weekend evening."
  },
  {
    title: "AI & Biotech Founder Firechat",
    category: "Social",
    description: "A private dining room meetup of founders, longevity researchers, and developers discussing biological diagnostic tooling and machine learning models for longevity therapeutics.",
    estimatedCost: 3500,
    targetThreshold: 20,
    image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800",
    playbook_concept: "Private dining longevity research and tech founder dinner.",
    playbook_vibe: "Collaborative, intellectual, confidential",
    playbook_requirements: "Private dining room, round table alignment, pre-circulated Longevity paper reading",
    playbook_conditions: "Weekday evening."
  },
  {
    title: "Wilderness Astronomy Camp",
    category: "Outdoors",
    description: "Escape the city lights for a guided night of stargazing in the hills. Includes high-powered telescope walkthroughs, stargazing chart packets, premium tents, and organic farm meals.",
    estimatedCost: 5000,
    targetThreshold: 25,
    image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800",
    playbook_concept: "Overnight astronomy camp and stargazing guided excursion.",
    playbook_vibe: "Adventurous, educational, clean air",
    playbook_requirements: "Dark sky zone site, telescope guide, high-quality tents, bonfire circle",
    playbook_conditions: "Saturday night (clear weather check)."
  }
];

export default function CreateProposal() {
  const router = useRouter();
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [estimatedCost, setEstimatedCost] = useState('3000');
  const [targetThreshold, setTargetThreshold] = useState('30');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800');
  
  // Playbook States
  const [playbookConcept, setPlaybookConcept] = useState('');
  const [playbookVibe, setPlaybookVibe] = useState('');
  const [playbookRequirements, setPlaybookRequirements] = useState('');
  const [playbookConditions, setPlaybookConditions] = useState('');

  const [aiRefining, setAiRefining] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Apply Inspiration Template
  const handleApplyTemplate = (temp) => {
    setTitle(temp.title);
    setCategory(temp.category);
    setDescription(temp.description);
    setEstimatedCost(temp.estimatedCost.toString());
    setTargetThreshold(temp.targetThreshold.toString());
    setImage(temp.image);
    setPlaybookConcept(temp.playbook_concept);
    setPlaybookVibe(temp.playbook_vibe);
    setPlaybookRequirements(temp.playbook_requirements);
    setPlaybookConditions(temp.playbook_conditions);
  };

  // Simulating AI Copy Refinement
  const handleAiRefine = () => {
    if (!title && !description) {
      alert("Please provide at least a title or a draft description for the AI to refine.");
      return;
    }
    
    setAiRefining(true);
    setTimeout(() => {
      // Enhanced copy presets based on user input
      const refinedTitle = title ? `Resonant: ${title}` : "Curated Omakase & Vinyl Night";
      const refinedDesc = description 
        ? `A meticulously structured experience featuring ${description}. Designed to align city-wide interest under a single premium theme, including specialized catering, acoustic treatments, and custom curations.`
        : "An intimate gathering designed to bridge local food enthusiasts and artisanal culinary masters, featuring a multi-course seasonal tasting menu, boutique wine pairings, and local acoustic musicians.";
      
      setTitle(refinedTitle);
      setDescription(refinedDesc);
      
      if (!playbookConcept) setPlaybookConcept(`Curated thematic execution of ${title || 'experience'}`);
      if (!playbookVibe) setPlaybookVibe("Warm, refined, collaborative");
      if (!playbookRequirements) setPlaybookRequirements("Communal seating, dedicated chef, customized lighting, visual storyboards");
      if (!playbookConditions) setPlaybookConditions("Friday/Saturday evening availability.");
      
      setAiRefining(false);
    }, 1200);
  };

  // Submit Proposal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Title and description are required.");
      return;
    }

    setSubmitting(true);
    
    // Parse comma-separated requirements
    const reqArray = playbookRequirements
      ? playbookRequirements.split(',').map(r => r.trim()).filter(r => r.length > 0)
      : ["Curated thematic experience hosting", "Acoustic control and dedicated hosting"];

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin',
          title,
          description,
          category,
          estimatedCost,
          targetThreshold,
          image,
          playbook_concept: playbookConcept || title,
          playbook_vibe: playbookVibe || "Editorial, curated",
          playbook_requirements: reqArray,
          playbook_conditions: playbookConditions || "Weekends preferred"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Proposal Created! Your campaign is now live on the feed. You gained +50 Scout points!");
        router.push('/');
      }
    } catch (err) {
      console.error("Failed to create proposal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="creator-layout">
      {/* Left: Input Form Panel */}
      <div className="studio-panel">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>Create Proposal Studio</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--bg-neutral-muted)' }}>
            Design a premium offline experience. Gather local backing demand, then venues will bid to host it.
          </p>
        </div>

        {/* Onboarding Inspiration Suggestions */}
        <div className="inspiration-container">
          <label style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-sage)', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="icon-inline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>
            </span>
            Quick Inspiration templates
          </label>
          <div className="inspiration-gallery">
            {INSPIRATION_TEMPLATES.map((temp, i) => (
              <button 
                key={i} 
                type="button" 
                className="inspiration-item"
                onClick={() => handleApplyTemplate(temp)}
              >
                <div className="inspiration-title">{temp.title}</div>
                <div className="inspiration-desc">{temp.category} · ₹{temp.estimatedCost.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Proposer identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
            alt="Kranti" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Kranti (admin)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bg-neutral-muted)' }}>City Scout Badge · Founder Identity Prominent on Card</div>
          </div>
        </div>

        {/* Propose Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="Food">Food & Drink</option>
              <option value="Performance">Intimate Performances</option>
              <option value="Social">Premium Social Gatherings</option>
              <option value="Outdoors">Outdoor Excursions</option>
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Experience Title</label>
              <button 
                type="button" 
                className="ai-suggest-btn"
                onClick={handleAiRefine}
                disabled={aiRefining}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span className="icon-inline">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
                </span>
                {aiRefining ? "Refining..." : "AI Assist Copy"}
              </button>
            </div>
            <input 
              type="text"
              placeholder="e.g., Speakeasy Hidden Chef's Table"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>The Vision & Details</label>
            <textarea 
              rows={4}
              placeholder="Describe the experience. What makes it special? What is the atmosphere?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Est. Cost per Head (WTP)</label>
              <input 
                type="number"
                placeholder="e.g., 3500"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Target Threshold (Backers)</label>
              <input 
                type="number"
                placeholder="e.g., 30"
                value={targetThreshold}
                onChange={(e) => setTargetThreshold(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Theme Image Simulation</label>
            <select 
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="form-input"
            >
              <option value="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800">Chef's Table / Japanese Omakase</option>
              <option value="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800">Jazz Club terrace</option>
              <option value="https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800">Private Longevity Salon room</option>
              <option value="https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800">Astronomy hill camp</option>
              <option value="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800">Classic Italian Dining</option>
            </select>
          </div>

          {/* Event Playbook spec block */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-sage)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="icon-inline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
              </span>
              Structured Event Playbook Blueprint
            </h3>
            
            <div className="form-group">
              <label>Playbook Concept Summary</label>
              <input 
                type="text"
                placeholder="e.g., Omakase dining paired with Niigata sakes"
                value={playbookConcept}
                onChange={(e) => setPlaybookConcept(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Vibe & Aesthetic Description</label>
              <input 
                type="text"
                placeholder="e.g., Low-light, minimal, unhurried, wood acoustics"
                value={playbookVibe}
                onChange={(e) => setPlaybookVibe(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Key Execution Requirements (Comma Separated)</label>
              <input 
                type="text"
                placeholder="e.g., Communal table, 5-course menu, sake pairing Sommelier"
                value={playbookRequirements}
                onChange={(e) => setPlaybookRequirements(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Scheduling Constraints & Conditions</label>
              <input 
                type="text"
                placeholder="e.g., Friday/Saturday evening only, capacity limit 24"
                value={playbookConditions}
                onChange={(e) => setPlaybookConditions(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0.85rem', width: '100%', fontSize: '1.05rem', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? "Launching Campaign..." : "Publish Proposal & Share"}
          </button>
        </form>
      </div>

      {/* Right: Sticky Live Card Preview */}
      <div className="preview-container">
        <div className="live-card-preview">
          <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--bg-neutral-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
            📱 Live Feed Card Preview
          </label>
          
          {/* Simulated Mobile Frame containing feed card */}
          <div style={{ border: '8px solid var(--bg-neutral-dark)', borderRadius: '24px', overflow: 'hidden', width: '320px', height: '520px', background: '#000', margin: '0 auto', position: 'relative', boxShadow: 'var(--shadow-hover)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div className="card-gradient-overlay" />
            </div>

            {/* Simulated overlay card contents */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '1rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '0.65rem', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
                  alt="Avatar" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--accent-terracotta)', objectFit: 'cover' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Proposed by me</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>City Scout</span>
                </div>
                <span className="badge badge-scout" style={{ padding: '2px 6px', fontSize: '0.6rem', marginLeft: 'auto' }}>
                  {category}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{title || "Untitled Experience"}</h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: '1.4', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {description || "Provide a description in the editor to populate this card visual preview."}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="icon-inline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
                </span>
                Vibe: {playbookVibe || "Editorial"}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                  <span>Rally Target</span>
                  <span>1 / {targetThreshold} Backers</span>
                </div>
                <div className="progress-bar-container" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.round((1 / parseInt(targetThreshold)) * 100)}%` }} />
                </div>
              </div>

              <button className="btn btn-primary" style={{ padding: '0.45rem', fontSize: '0.8rem', cursor: 'default' }} disabled>
                Rally Interest (₹{parseInt(estimatedCost).toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
