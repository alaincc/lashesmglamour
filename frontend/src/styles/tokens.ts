export const tokens = {
  colors: {
    black: "#0B0B0B",       // Velvet Black (primary background)
    gold: "#D4AF37",        // Luxe Gold (primary brand color)
    champagne: "#F0E6D2",   // Champagne Gold (light accents/text)
    grey: {
      dark: "#1D1D1F",      // Warm Clay (secondary backgrounds/cards)
      muted: "#8E8E93",     // Soft Muted Grey (descriptions/borders)
      light: "#3A3A3C",     // Mid-grey borders
    },
    ivory: "#F9F6F0",       // Pure Ivory (readable content text)
  },
  radius: {
    none: "0px",
    sm: "2px",
    md: "4px",              // Default brand roundness
    lg: "8px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    gold: "0 4px 20px 0 rgba(212, 175, 55, 0.15)", // Premium soft gold glow
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    section: {
      desktop: "6rem",
      mobile: "4rem",
    },
  },
  breakpoints: {
    mobile: "768px",        // Up to 767px is mobile
    tablet: "768px",        // 768px and up
    desktop: "1024px",      // 1024px and up
    largeDesktop: "1440px", // 1440px and up
  },
  typography: {
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Montserrat', Helvetica, Arial, sans-serif",
    },
    sizes: {
      h1: {
        desktop: "3.25rem",
        mobile: "2.25rem",
      },
      h2: {
        desktop: "2.25rem",
        mobile: "1.75rem",
      },
      h3: {
        desktop: "1.5rem",
        mobile: "1.25rem",
      },
      body: "1rem",
      small: "0.875rem",
    },
  },
};
export type Tokens = typeof tokens;
