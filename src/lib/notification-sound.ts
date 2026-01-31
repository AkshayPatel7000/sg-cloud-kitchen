// Notification Sound Generator
// This file creates a notification sound using Web Audio API

export function createNotificationSound(): HTMLAudioElement {
  // Create a simple notification beep using data URL
  // This is a base64 encoded short beep sound
  const audio = new Audio();

  // Alternative: Use a simple tone generator
  const audioContext = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();

  const playBeep = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // First beep
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Second beep
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 1000;
      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.15);
    }, 150);
  };

  // Override play method
  audio.play = async () => {
    playBeep();
    return Promise.resolve();
  };

  return audio;
}
