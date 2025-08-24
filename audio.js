document.addEventListener('DOMContentLoaded', () => {
  const omAudio = document.getElementById("omAudio");

  const enableAudio = () => {
    omAudio.volume = 0.1;
    omAudio.play();
    document.removeEventListener('scroll', enableAudio);
  };

  document.addEventListener('scroll', enableAudio);
});
