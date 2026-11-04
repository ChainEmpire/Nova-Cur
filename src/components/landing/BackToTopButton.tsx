export default function BackToTopButton() {
  const handleBackToTop = () => {
    if (typeof window === "undefined") return;

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    const animateWindowScroll = (start: number, duration = 700) => {
      const startTime = performance.now();

      const tick = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const nextPosition = start * (1 - eased);

        window.scrollTo({ top: nextPosition, left: 0, behavior: "auto" });

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const animateElementScroll = (element: HTMLElement, start: number, duration = 700) => {
      const startTime = performance.now();

      const tick = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const nextPosition = start * (1 - eased);

        element.scrollTop = Math.max(0, nextPosition);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    if (window.scrollY > 0) {
      animateWindowScroll(window.scrollY);
    }

    const elements = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById("dashboard"),
    ].filter((element): element is HTMLElement => Boolean(element) && element instanceof HTMLElement);

    elements.forEach((element) => {
      if (element.scrollTop > 0) {
        animateElementScroll(element, element.scrollTop);
      }
    });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleBackToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/60 bg-slate-950/90 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.35)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-cyan-300 hover:text-white translate-y-0 opacity-100"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
