export const tokens = {
  colors: {
    white: "#FFFFFF",
    pink: "#D12E66",
    pinkHover: "#E13D7A",
    lightPink: "#FFF5F7",
    gold: "#C5A880",
    dark: "#0E0D0B",
    charcoal: "#111111",
    grey: {
      muted: "#71717A",
      border: "#E4E4E7",
    }
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
    pink: "0 4px 20px 0 rgba(209, 46, 102, 0.15)",
    glass: "0 8px 32px 0 rgba(255, 255, 255, 0.1)",
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
      script: "'Alex Brush', cursive",
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

