import confetti from "@hiseb/confetti";

export function launchCelebrationConfetti(): () => void {
  const positions = [
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 },
    { x: window.innerWidth * 0.25, y: window.innerHeight * 0.1 },
    { x: window.innerWidth * 0.25, y: window.innerHeight * 0.4 },
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.8 },
    { x: window.innerWidth * 0.75, y: window.innerHeight * 0.3 },
  ];
  const timeoutIds = positions.map((position, index) =>
    window.setTimeout(() => confetti({ position }), index * 250)
  );

  return () => {
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  };
}
