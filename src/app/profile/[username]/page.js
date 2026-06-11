"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function UserProfile() {
  const params = useParams();
  const username = params.username;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--bg-neutral-muted)' }}>
        Accessing scout profile records...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--accent-terracotta)' }}>
        User profile not found.
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header card */}
      <div className="profile-header-card">
        <img 
          src={profile.avatar} 
          alt={profile.name} 
          className="profile-avatar" 
        />
        <div className="profile-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700' }}>{profile.name}</h1>
            <span className="badge badge-scout">{profile.badge}</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--bg-neutral-muted)', marginTop: '0.25rem' }}>
            Scout Username: <strong>@{profile.username}</strong> · Total Points: <strong>{profile.points} pts</strong>
          </p>
          
          {/* PCP preference summary */}
          <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--bg-neutral-muted)', fontWeight: '700', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              🎯 Personal Context Protocol (PCP) Profile
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <span className="badge badge-backer">Categories: {profile.pcpProfile.categories.join(', ')}</span>
              <span className="badge badge-backer">Budget Tier: {profile.pcpProfile.budget}</span>
              <span className="badge badge-backer">Prefer Availability: {profile.pcpProfile.availability}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scout Timeline */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>
          Scout Contribution Timeline
        </h2>
        
        {profile.contributions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--bg-neutral-muted)' }}>
            No timeline contributions logged yet. Rally or propose an experience to begin your timeline!
          </div>
        ) : (
          <div className="profile-timeline">
            {profile.contributions.map((cnt) => {
              const date = new Date(cnt.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div className="timeline-item" key={cnt.id}>
                  <div className={`timeline-dot ${cnt.actionType === 'ACTIVATE' ? 'activated' : ''}`} />
                  
                  <div className="timeline-content">
                    <div className="timeline-time">{date}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="timeline-title">{cnt.description}</span>
                      
                      <span 
                        className="badge" 
                        style={{ 
                          marginLeft: 'auto', 
                          fontSize: '0.65rem', 
                          padding: '2px 8px',
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

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={`/proposals/${cnt.proposalId}`} 
                        style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: '600' }}
                      >
                        View Experience →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
