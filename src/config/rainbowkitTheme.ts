import { darkTheme } from "@rainbow-me/rainbowkit";



const base = darkTheme({
  accentColor: "#06b6d4",
  accentColorForeground: "#ffffff",
  borderRadius: "large",
  overlayBlur: "large",
});

export const novaFiRainbowKitTheme = {
  ...base,
  colors: {
    ...base.colors,
    modalBackground: "#0c0c24",
    modalBorder: "rgba(49, 46, 129, 0.4)",
    modalBackdrop: "rgba(3, 3, 15, 0.85)",
    modalText: "#f1f5f9",
    modalTextDim: "rgba(148, 163, 184, 0.7)",
    modalTextSecondary: "rgba(148, 163, 184, 0.9)",
    generalBorder: "rgba(49, 46, 129, 0.4)",
    generalBorderDim: "rgba(49, 46, 129, 0.2)",
    profileForeground: "#0c0c24",
    menuItemBackground: "rgba(255, 255, 255, 0.03)",
    profileAction: "rgba(255, 255, 255, 0.03)",
    profileActionHover: "rgba(6, 182, 212, 0.14)",
    actionButtonBorder: "rgba(67, 56, 202, 0.4)",
    actionButtonBorderMobile: "rgba(67, 56, 202, 0.5)",
    actionButtonSecondaryBackground: "rgba(255, 255, 255, 0.03)",
    connectButtonBackground: "#080818",
    connectButtonInnerBackground: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)",
    connectButtonText: "#ffffff",
    connectButtonBackgroundError: "#e11d48",
    connectButtonTextError: "#ffffff",
    selectedOptionBorder: "rgba(6, 182, 212, 0.7)",
    closeButtonBackground: "rgba(255, 255, 255, 0.06)",
    closeButton: "#94a3b8",
    standby: "#eab308",
    error: "#e11d48",
  },
  shadows: {
    ...base.shadows,

    dialog:
      "0 0 0 1px rgba(6, 182, 212, 0.12), 0 30px 60px -15px rgba(124, 58, 237, 0.45), 0 50px 90px -20px rgba(0, 0, 0, 0.65)",

    selectedWallet: "0 0 0 2px rgba(6, 182, 212, 0.65), 0 0 24px rgba(124, 58, 237, 0.35)",
  },
  radii: {
    ...base.radii,
    modal: "1rem",
    modalMobile: "1rem",
    actionButton: "0.75rem",
    connectButton: "0.75rem",
    menuButton: "0.75rem",
  },
  fonts: {
    body: "Inter, sans-serif",
  },
};
