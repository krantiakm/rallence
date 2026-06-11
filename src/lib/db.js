import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'rallence_db.json');

// Seed Data
const SEED_USERS = {
  admin: {
    username: 'admin',
    name: 'Kranti',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    badge: 'City Scout',
    points: 320,
    pcpProfile: {
      categories: ['Food', 'Social'],
      budget: 'Medium-High',
      availability: 'Weekends'
    }
  },
  user_1: {
    username: 'user_1',
    name: 'Aarav',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    badge: 'Proposal Founder',
    points: 150,
    pcpProfile: {
      categories: ['Social', 'Outdoors'],
      budget: 'High',
      availability: 'Anytime'
    }
  },
  user_2: {
    username: 'user_2',
    name: 'Ananya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    badge: 'Taste Curator',
    points: 280,
    pcpProfile: {
      categories: ['Food'],
      budget: 'High',
      availability: 'Weekends'
    }
  },
  user_3: {
    username: 'user_3',
    name: 'Vikram',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    badge: 'Backer',
    points: 90,
    pcpProfile: {
      categories: ['Performance'],
      budget: 'Medium',
      availability: 'This Weekend'
    }
  }
};

const SEED_PROPOSALS = [
  {
    id: 'prop-1',
    title: "Hidden Japanese Chef's Table",
    description: "An exclusive 20-seat communal dinner preparing seasonal washoku cuisine paired with boutique sakes sourced directly from small breweries in Niigata. We will dine around a single solid wood bar table with the chef explaining the heritage of each course.",
    category: 'Food',
    creatorId: 'user_2',
    status: 'TERMS_OFFERED',
    targetThreshold: 30,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    playbook: {
      concept: "Communal 5-course washoku dinner paired with craft sakes.",
      key_requirements: [
        "Communal counter seating for 20-30 guests max.",
        "5-course curated tasting menu.",
        "Sake pairing explanations from a certified sommelier/chef.",
        "Minimalist, low-light architectural atmosphere."
      ],
      vibe: "Sensorial, quiet, high-integrity",
      target_audience: "Gastronomy enthusiasts, sake connoisseurs, and local scouts",
      conditions: "Must run on a Friday or Saturday evening, ticket price targeting ₹4,000 to ₹5,500."
    },
    supporters: [
      { userId: 'user_2', willingnessToPay: 5500, availability: 'Weekends' },
      { userId: 'admin', willingnessToPay: 4800, availability: 'Weekends' },
      { userId: 'user_3', willingnessToPay: 4500, availability: 'This Weekend' }
    ],
    // Simulating additional anonymous supporters to reach 28
    supporterCountOffset: 25, 
    bids: [
      {
        id: 'bid-1-1',
        providerName: "Shibui Bengaluru",
        providerLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80",
        price: 4800,
        proposedDate: "Saturday, July 11th, 7:30 PM",
        capacity: 30,
        terms: "5-course premium menu, 4 sake flights included, communal counter reservation. 24 committed tickets required to confirm.",
        votes: ['user_2', 'admin']
      },
      {
        id: 'bid-1-2',
        providerName: "Gagan's Omakase Bar",
        providerLogo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=80",
        price: 6000,
        proposedDate: "Friday, July 10th, 8:00 PM",
        capacity: 20,
        terms: "Communal table take-over, 7-course seasonal menu, premium Niigata sake. 18 committed tickets required to confirm.",
        votes: ['user_3']
      }
    ],
    activeBidId: null,
    inviteFriendsCount: 42
  },
  {
    id: 'prop-2',
    title: "Rooftop Jazz & Wine Evening",
    description: "An open-air acoustic jazz session on a sunset terrace. Bring together the city's finest independent instrumentalists for an unamplified, warm performance while sampling four curated organic/biodynamic wines.",
    category: 'Performance',
    creatorId: 'user_3',
    status: 'GATHERING_DEMAND',
    targetThreshold: 50,
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    playbook: {
      concept: "Sunset acoustic jazz session with organic wine tasting flight.",
      key_requirements: [
        "Open-air rooftop or garden terrace with natural resonance.",
        "Unamplified or acoustic-focused sound setup.",
        "4-pour natural wine tasting flight with small grazing plates.",
        "Comfortable floor cushions and warm lighting."
      ],
      vibe: "Refined, conversational, breezy",
      target_audience: "Wine explorers, acoustic music lovers, and weekend winding-down circles",
      conditions: "Saturday sunset hours (5:00 PM - 8:30 PM), ticket price ₹2,500 - ₹3,500."
    },
    supporters: [
      { userId: 'user_3', willingnessToPay: 3000, availability: 'This Weekend' },
      { userId: 'admin', willingnessToPay: 3500, availability: 'Weekends' }
    ],
    supporterCountOffset: 32,
    bids: [],
    activeBidId: null,
    inviteFriendsCount: 15
  },
  {
    id: 'prop-3',
    title: "AI & Health Founder Dinner",
    description: "A high-trust private dining experience bringing together founders, researchers, and builders in the artificial intelligence and longevity medicine space. Discussions centered on biological age diagnostics, machine learning models for drug discovery, and scaling preventative clinics.",
    category: 'Social',
    creatorId: 'admin',
    status: 'ACTIVATED',
    targetThreshold: 20,
    image: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800',
    playbook: {
      concept: "Curated tech founder and research scientist longevity salon.",
      key_requirements: [
        "Private dining room with solid acoustics (no loud background music).",
        "Single round table setup to foster unified conversation.",
        "Multi-course healthy/nutrient-dense chef's selection.",
        "Pre-circulated discussion topics/reading materials."
      ],
      vibe: "Intellectual, collaborative, safe",
      target_audience: "Founders, researchers, medical operators, and investors",
      conditions: "Weekday evening (Tuesday/Wednesday), budget ₹3,500."
    },
    supporters: [
      { userId: 'admin', willingnessToPay: 3500, availability: 'Weekdays' },
      { userId: 'user_1', willingnessToPay: 4000, availability: 'Anytime' },
      { userId: 'user_2', willingnessToPay: 3500, availability: 'Weekdays' }
    ],
    supporterCountOffset: 17,
    bids: [
      {
        id: 'bid-3-1',
        providerName: "Indiranagar Social (Green Room)",
        providerLogo: "https://images.unsplash.com/photo-1571997478779-2adacdf98572?w=80",
        price: 3500,
        proposedDate: "Wednesday, July 15th, 7:30 PM",
        capacity: 20,
        terms: "Private Green Room reservation, healthy 4-course menu (vegan options), smart-board availability. Bid accepted by founder.",
        votes: ['admin', 'user_1', 'user_2']
      }
    ],
    activeBidId: 'bid-3-1',
    inviteFriendsCount: 68
  },
  {
    id: 'prop-4',
    title: "Parent-Child Astronomy Camp",
    description: "Escape the city's light pollution for a weekend night in the Kanakapura hills. A hands-on guide to telescopes, reading star charts, and identifying planets, combined with a bonfire and camping under clear skies. Designed specifically for parents and children to share curiosity.",
    category: 'Outdoors',
    creatorId: 'user_1',
    status: 'GATHERING_DEMAND',
    targetThreshold: 25,
    image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800',
    playbook: {
      concept: "Overnight astronomy camp and guide-led stargazing for families.",
      key_requirements: [
        "Dark sky location within 1.5 hours of city center.",
        "Stargazing guide and high-powered telescopes.",
        "Premium tents, clean washrooms, and safe campfire circle.",
        "Kid-friendly menu options and star charts to take home."
      ],
      vibe: "Awe-inspiring, educational, wholesome",
      target_audience: "Curious parents, children (ages 6-15), astronomy hobbyists",
      conditions: "Clear weekend night (no full moon), ticket price ₹4,500 per family pair."
    },
    supporters: [
      { userId: 'user_1', willingnessToPay: 5000, availability: 'Weekends' }
    ],
    supporterCountOffset: 11,
    bids: [],
    activeBidId: null,
    inviteFriendsCount: 8
  }
];

const SEED_CONTRIBUTIONS = [
  {
    id: 'cnt-1',
    userId: 'user_2',
    proposalId: 'prop-1',
    actionType: 'CREATE',
    description: "Proposed the Hidden Japanese Chef's Table",
    timestamp: "2026-06-08T12:00:00Z"
  },
  {
    id: 'cnt-2',
    userId: 'user_2',
    proposalId: 'prop-1',
    actionType: 'RECRUIT',
    description: "Recruited 28 backers and established resonance in Bangalore",
    timestamp: "2026-06-09T18:30:00Z"
  },
  {
    id: 'cnt-3',
    userId: 'user_3',
    proposalId: 'prop-2',
    actionType: 'CREATE',
    description: "Proposed the Rooftop Jazz & Wine Evening",
    timestamp: "2026-06-10T10:15:00Z"
  },
  {
    id: 'cnt-4',
    userId: 'admin',
    proposalId: 'prop-3',
    actionType: 'CREATE',
    description: "Proposed the AI & Health Founder Dinner",
    timestamp: "2026-06-05T09:00:00Z"
  },
  {
    id: 'cnt-5',
    userId: 'admin',
    proposalId: 'prop-3',
    actionType: 'CONNECT_PROVIDER',
    description: "Connected Indiranagar Social and negotiated the private green room bid",
    timestamp: "2026-06-07T14:20:00Z"
  },
  {
    id: 'cnt-6',
    userId: 'admin',
    proposalId: 'prop-3',
    actionType: 'ACTIVATE',
    description: "Accepted Indiranagar Social's bid and activated the dinner",
    timestamp: "2026-06-10T11:00:00Z"
  }
];

// Helper to initialize DB file if not exists
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const data = {
      users: SEED_USERS,
      proposals: SEED_PROPOSALS,
      contributions: SEED_CONTRIBUTIONS
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  }
}

// Read database
function readDB() {
  initDB();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

// Write database
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Exported Service Methods (REST Ready)
export const dbService = {
  // Get all proposals, sorted by Personal Context Protocol (PCP) for a specific user
  getProposals(userId = 'admin') {
    const db = readDB();
    const user = db.users[userId] || db.users['admin'];
    
    // Sort logic using Personal Context Protocol (PCP) matching:
    // 1. Categories match user's preferred categories get a boost.
    // 2. Budget overlaps with user's preferred budget tier.
    // 3. Score calculated.
    return db.proposals.map(prop => {
      let score = 0;
      
      // Category overlap
      if (user.pcpProfile.categories.includes(prop.category)) {
        score += 10;
      }
      
      // Willingness to Pay overlap
      const avgWtp = prop.supporters.reduce((sum, s) => sum + s.willingnessToPay, 0) / (prop.supporters.length || 1);
      if (user.pcpProfile.budget === 'High' && avgWtp > 4000) score += 5;
      if (user.pcpProfile.budget === 'Medium-High' && avgWtp >= 3000 && avgWtp <= 5000) score += 5;
      if (user.pcpProfile.budget === 'Medium' && avgWtp < 3500) score += 5;

      // Creator preference
      if (prop.creatorId === userId) {
        score += 2; // slight bump for own proposals
      }

      return { ...prop, pcpScore: score };
    }).sort((a, b) => b.pcpScore - a.pcpScore);
  },

  // Get specific proposal
  getProposal(id) {
    const db = readDB();
    return db.proposals.find(p => p.id === id) || null;
  },

  // Support/rally for a proposal
  supportProposal(proposalId, userId, willingnessToPay, availability) {
    const db = readDB();
    const proposal = db.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    // Check if user already supported
    const existingIndex = proposal.supporters.findIndex(s => s.userId === userId);
    if (existingIndex > -1) {
      proposal.supporters[existingIndex] = { userId, willingnessToPay, availability };
    } else {
      proposal.supporters.push({ userId, willingnessToPay, availability });
    }

    // Update the user's PCP preferences based on their support choices
    const user = db.users[userId];
    if (user) {
      // Add category to preferences if not present
      if (!user.pcpProfile.categories.includes(proposal.category)) {
        user.pcpProfile.categories.push(proposal.category);
      }
      // Update preferred availability
      user.pcpProfile.availability = availability;
      // Update points for backing
      user.points += 10;
    }

    // Create a scout contribution event
    const contribution = {
      id: `cnt-${Date.now()}`,
      userId,
      proposalId,
      actionType: 'RALLY',
      description: `Rallied for ${proposal.title} (Committed ₹${willingnessToPay}, Available: ${availability})`,
      timestamp: new Date().toISOString()
    };
    db.contributions.push(contribution);

    writeDB(db);
    return proposal;
  },

  // Invite friends (Simulated virality)
  inviteFriends(proposalId, userId, count) {
    const db = readDB();
    const proposal = db.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    proposal.inviteFriendsCount = (proposal.inviteFriendsCount || 0) + count;
    
    // Add scout points for sharing/inviting
    const user = db.users[userId];
    if (user) {
      user.points += count * 5; // 5 points per invite
    }

    // Create scout contribution event
    const contribution = {
      id: `cnt-${Date.now()}`,
      userId,
      proposalId,
      actionType: 'RECRUIT',
      description: `Invited ${count} friends to rally for ${proposal.title}`,
      timestamp: new Date().toISOString()
    };
    db.contributions.push(contribution);

    writeDB(db);
    return proposal;
  },

  // Create new proposal (AI-Assisted)
  createProposal(userId, proposalData) {
    const db = readDB();
    
    const newProposal = {
      id: `prop-${Date.now()}`,
      title: proposalData.title,
      description: proposalData.description,
      category: proposalData.category || 'Social',
      creatorId: userId,
      status: 'GATHERING_DEMAND',
      targetThreshold: parseInt(proposalData.targetThreshold) || 30,
      image: proposalData.image || 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800',
      playbook: {
        concept: proposalData.playbook_concept || proposalData.description.substring(0, 100),
        key_requirements: proposalData.playbook_requirements || [
          "Curated thematic experience hosting",
          "Capacity matching the proposal target"
        ],
        vibe: proposalData.playbook_vibe || "Curated, premium, social",
        target_audience: proposalData.playbook_audience || "Urban experience hunters",
        conditions: proposalData.playbook_conditions || "Must fit creator specifications"
      },
      supporters: [
        { 
          userId, 
          willingnessToPay: parseInt(proposalData.estimatedCost) || 3000, 
          availability: 'Anytime' 
        }
      ],
      supporterCountOffset: 0,
      bids: [],
      activeBidId: null,
      inviteFriendsCount: 0
    };

    db.proposals.push(newProposal);

    // Update user points and badge
    const user = db.users[userId];
    if (user) {
      user.points += 50; // Big bonus for creating a proposal
      user.badge = 'Proposal Founder';
      
      // Add category to user preferences
      if (!user.pcpProfile.categories.includes(newProposal.category)) {
        user.pcpProfile.categories.push(newProposal.category);
      }
    }

    // Create a scout contribution event
    const contribution = {
      id: `cnt-${Date.now()}`,
      userId,
      proposalId: newProposal.id,
      actionType: 'CREATE',
      description: `Proposed the experience: ${newProposal.title}`,
      timestamp: new Date().toISOString()
    };
    db.contributions.push(contribution);

    writeDB(db);
    return newProposal;
  },

  // Submit a Provider Offer (B2B Radar)
  submitProviderBid(proposalId, bidData) {
    const db = readDB();
    const proposal = db.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    const newBid = {
      id: `bid-${proposal.id}-${Date.now()}`,
      providerName: bidData.providerName,
      providerLogo: bidData.providerLogo || "https://images.unsplash.com/photo-1571997478779-2adacdf98572?w=80",
      price: parseInt(bidData.price),
      proposedDate: bidData.proposedDate,
      capacity: parseInt(bidData.capacity),
      terms: bidData.terms,
      votes: []
    };

    proposal.bids.push(newBid);
    proposal.status = 'TERMS_OFFERED'; // transition state

    writeDB(db);
    return proposal;
  },

  // Accept a Provider Bid (Transitions to Activated)
  acceptProviderBid(proposalId, bidId, userId) {
    const db = readDB();
    const proposal = db.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    // Check if the user is the creator (only the founder can accept terms)
    if (proposal.creatorId !== userId && userId !== 'admin') {
      throw new Error("Only the Proposal Founder can accept terms and activate the experience.");
    }

    const bid = proposal.bids.find(b => b.id === bidId);
    if (!bid) return null;

    proposal.activeBidId = bidId;
    proposal.status = 'ACTIVATED';

    // Create scout contribution event
    const contribution = {
      id: `cnt-${Date.now()}`,
      userId,
      proposalId,
      actionType: 'ACTIVATE',
      description: `Accepted bid from ${bid.providerName} and activated the experience!`,
      timestamp: new Date().toISOString()
    };
    db.contributions.push(contribution);

    // Give points to the founder for successful activation
    const user = db.users[userId];
    if (user) {
      user.points += 100; // Large reward!
    }

    writeDB(db);
    return proposal;
  },

  // Vote on a Provider Bid
  voteOnProviderBid(proposalId, bidId, userId) {
    const db = readDB();
    const proposal = db.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    const bid = proposal.bids.find(b => b.id === bidId);
    if (!bid) return null;

    if (!bid.votes) bid.votes = [];
    
    // Toggle vote
    const voteIdx = bid.votes.indexOf(userId);
    if (voteIdx > -1) {
      bid.votes.splice(voteIdx, 1);
    } else {
      bid.votes.push(userId);
    }

    writeDB(db);
    return proposal;
  },

  // Get user profile data and contributions
  getUserProfile(username) {
    const db = readDB();
    const user = db.users[username];
    if (!user) return null;

    const contributions = db.contributions
      .filter(c => c.userId === username)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      ...user,
      contributions
    };
  },

  // Reset database to seeds (for convenience)
  resetDB() {
    const data = {
      users: SEED_USERS,
      proposals: SEED_PROPOSALS,
      contributions: SEED_CONTRIBUTIONS
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return data;
  }
};
