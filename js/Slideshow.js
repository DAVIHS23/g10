const track = document.getElementById("home-track");
let direction = 1; // To move from left to right initially
let isDragging = false;

// Function to apply effect to images
function applyImageEffect(percentage) {
  const images = track.getElementsByClassName("carimage");
  for (const image of images) {
    const effect = (100 + percentage) * 0.5; // Adjust the 0.5 to control the effect strength
    image.style.objectPosition = `${effect}% center`;
  }
}

// Automated animation
function animateTrack() {
    if (isDragging) return;
  
    let start = null;
    const initialOffset = -101; // Starting at -101%
    const movementRange = 92; // Will move 92% more to the left and back
    const duration = 40000; // Duration in milliseconds for the track to move
  
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
  
      // This will oscillate between -101% to -9% and back to -101%
      const percentage = initialOffset + Math.sin(progress * Math.PI) * movementRange;
  
      track.style.transform = `translateX(${percentage}%)`;
      applyImageEffect(percentage); // Apply the effect
  
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // When progress equals 1 (or more), restart the animation
        start = null; // Reset the start time
        window.requestAnimationFrame(step);
      }
    }
  
    window.requestAnimationFrame(step);
  }
  
  // Start the automated animation
  animateTrack();


document.addEventListener('DOMContentLoaded', animateTrack);
