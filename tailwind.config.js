
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "var(--background, linear-gradient(135deg, #414593 0%, #00022E 100%))",
      },
      colors: {
        defaultButtongBg: "rgba(37, 157, 168, 0.08)",
        primary: {
          "900-high-emphasis": "#259DA8",
          "900-medium-emphasis": "#1E7E87",
        },
        "foreground-night": {
          100: "rgba(255, 255, 255, 0.03)",
          400: "rgba(255, 255, 255, 0.13)",
        },
        background: "linear-gradient(135deg, #414593 0%, #00022E 100%)",

        "nova-bg": "#050816",
        "nova-bg-alt": "#0a0f24",
        "nova-surface": "#0d1329",
        "nova-border": "#1e2a4a",
        "nova-emerald": "#10b981",
        "nova-cyan": "#06b6d4",
        "nova-blue": "#3b82f6",
        "nova-violet": "#8b5cf6",
        "nova-text": "#e8ecf8",
        "nova-muted": "#94a0c0",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "gradient-x": {
          from: { backgroundPosition: "0% 50%" },
          to: { backgroundPosition: "-200% 50%" },
        },
        "flash-up": {
          "0%": { color: "#10b981" },
          "100%": { color: "#e8ecf8" },
        },
        "flash-down": {
          "0%": { color: "#fb7185" },
          "100%": { color: "#e8ecf8" },
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-x": "gradient-x 8s linear infinite",
        "flash-up": "flash-up 1.2s ease-out",
        "flash-down": "flash-down 1.2s ease-out",
      },
      boxShadow: {
        custom:
          "0px 40.26560592651367px 50.332008361816406px -2.5166003704071045px rgba(0, 0, 0, 0.08), 0px 1.2583001852035522px 1.2583001852035522px 0px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        poppins: ["Poppins"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        xxs: "0.70rem",
        1.25831: "1.25831rem",
        lg: "1.125rem",
      },
      spacing: {
        "20.58369rem": "20.58369rem",
        1.25831: "0.315rem",
      },
      lineHeight: {
        2.202: "2.202rem",
        1.1875: "1.1875rem",
        12: 3.2,
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '100%': '100%',
      }
    },
  },
  plugins: [],
}
