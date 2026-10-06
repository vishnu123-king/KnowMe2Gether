import confetti from 'canvas-confetti';

export function triggerLoveConfetti() {
  // Fire colorful hearts and star confetti bursts
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#f43f5e', '#fb7185', '#ec4899', '#fbbf24', '#a855f7'],
    shapes: ['circle'],
  });

  setTimeout(() => {
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fda4af', '#f43f5e', '#fde047'],
    });
  }, 150);

  setTimeout(() => {
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#fb7185', '#ec4899', '#fde047'],
    });
  }, 300);
}
