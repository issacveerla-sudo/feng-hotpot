/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#140a07",        // near-black warm base
        charcoal: "#1d100b",   // slightly lifted panel
        ember: "#B5121B",      // deep brand red
        chili: "#E23B2E",      // bright red (buttons)
        flame: "#F2792B",      // orange glow
        gold: "#E8B04B",       // accent gold
        cream: "#F3E9D6",      // display / text
      },
      fontFamily: {
        display: ['"Bagel Fat One"', "cursive"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(242,121,43,0.55)",
        pill: "0 6px 20px -6px rgba(226,59,46,0.6)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
