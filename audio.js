document.addEventListener('DOMContentLoaded', () => {
  const omAudio = document.getElementById('omAudio');

  // Check if audio is already allowed to play
  const tryPlay = () => {
    omAudio.volume = 0.1;
    const playPromise = omAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Om audio playing.');
        })
        .catch(error => {
          console.warn('Audio autoplay failed:', error);
        });
    }
  };

  // Only trigger once on first scroll
  const handleFirstScroll = () => {
    tryPlay();
    window.removeEventListener('click', handleFirstScroll);
  };

  // Attach listener
  window.addEventListener('click', handleFirstScroll);
});
