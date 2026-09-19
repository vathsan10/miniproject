// A short synthesized beep for new-order alerts on the vendor dashboard.
// Generated with the Web Audio API rather than an audio file, so there's
// no asset to bundle or fetch.
export function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Autoplay/audio restrictions shouldn't break the dashboard.
  }
}
