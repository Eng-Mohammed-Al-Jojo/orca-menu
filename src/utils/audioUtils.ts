/**
 * Audio Utility
 * Provides methods for playing notification sounds
 */

class AudioPlayer {
    private static audio: HTMLAudioElement | null = null;
    private static isInitialized = false;

    /**
     * Initializes the audio element (must be called from a user interaction ideally
     * to prevent browser policy-blocking, though typically works out-of-the-box on desktop)
     */
    static init() {
        if (this.isInitialized) return;
        this.audio = new Audio('/ringtone.mp3');
        this.isInitialized = true;
    }

    /**
     * Plays the new order notification sound
     */
    static playNewOrderSound() {
        this.init();
        if (this.audio) {
            // Reset to start if already playing
            this.audio.pause();
            this.audio.currentTime = 0;
            
            // Play and catch any potential autoplay blocking errors
            this.audio.play().catch(error => {
                console.warn("Audio autoplay blocked by browser policies until user interacts with the document.", error);
            });
        }
    }
}

export const playNewOrderSound = () => {
    AudioPlayer.playNewOrderSound();
};
