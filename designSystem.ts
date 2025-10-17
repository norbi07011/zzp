// 🎨 ZZP WERKPLAATS DESIGN SYSTEM 2.0
// Futurystyczny design inspirowany logo z 3D elements, cyber blue, tech green

export const DESIGN_TOKENS = {
  // Kolory główne (z loga)
  colors: {
    primary: {
      dark: '#0f1419',      // Ultra dark background
      navy: '#1e3a5f',      // Logo navy blue
      slate: '#2d3748',     // Slate gray
      light: '#f8fafc',     // Light background
    },
    accent: {
      cyberBlue: '#00d4ff', // Świecący niebieski (główny akcent)
      techGreen: '#00ff88', // Success green (jak punkt w logo)
      neonPurple: '#a855f7', // Premium purple
      electricBlue: '#0080ff', // Electric blue
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    status: {
      success: '#00ff88',
      warning: '#fbbf24',
      error: '#ef4444',
      info: '#00d4ff',
    }
  },
  
  // Gradienty (futurystyczne)
  gradients: {
    primary: 'linear-gradient(135deg, #1e3a5f 0%, #0f1419 100%)',
    cyber: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
    success: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
    premium: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    glass: 'linear-gradient(135deg, rgba(30, 58, 95, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%)',
    hero: 'linear-gradient(180deg, #0f1419 0%, #1e3a5f 50%, #0f1419 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  },
  
  // Efekty świecenia (glow)
  glow: {
    cyber: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
    cyberStrong: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.5)',
    success: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
    premium: '0 0 30px rgba(168, 85, 247, 0.4)',
    soft: '0 0 10px rgba(0, 212, 255, 0.2)',
  },
  
  // Cienie (3D effects)
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 40px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.4)',
    card: '0 10px 40px rgba(0, 0, 0, 0.3)',
    cardHover: '0 20px 60px rgba(0, 212, 255, 0.2), 0 0 40px rgba(0, 212, 255, 0.1)',
    premium: '0 20px 50px rgba(168, 85, 247, 0.3)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  
  // Typography
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  // Border radius
  radius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    tooltip: 1400,
  }
};

// Helper functions
export const getGlowStyle = (type: 'cyber' | 'success' | 'premium' = 'cyber') => ({
  boxShadow: DESIGN_TOKENS.glow[type],
});

export const getGradientStyle = (type: keyof typeof DESIGN_TOKENS.gradients) => ({
  background: DESIGN_TOKENS.gradients[type],
});

export const getCardStyle = (hover = false) => ({
  background: DESIGN_TOKENS.gradients.card,
  backdropFilter: 'blur(10px)',
  border: `1px solid rgba(0, 212, 255, 0.1)`,
  boxShadow: hover ? DESIGN_TOKENS.shadows.cardHover : DESIGN_TOKENS.shadows.card,
  transition: 'all 0.3s ease',
});
