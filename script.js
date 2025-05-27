let pet = {
    hunger: 5,
    happiness: 5,
    cleanliness: 5,
  };
  
  function updateStats() {
    document.getElementById("stats").innerText =
      `Hunger: ${pet.hunger} | Happiness: ${pet.happiness} | Cleanliness: ${pet.cleanliness}`;
  }
  
  function feed() {
    pet.hunger = Math.max(0, pet.hunger - 1);
    updateStats();
  }
  
  function play() {
    pet.happiness = Math.min(10, pet.happiness + 1);
    updateStats();
  }
  
  function clean() {
    pet.cleanliness = Math.min(10, pet.cleanliness + 1);
    updateStats();
  }
  
  // Simulate needs decaying over time
  setInterval(() => {
    pet.hunger = Math.min(10, pet.hunger + 1);
    pet.happiness = Math.max(0, pet.happiness - 1);
    pet.cleanliness = Math.max(0, pet.cleanliness - 1);
  
    if (pet.hunger >= 10 || pet.happiness <= 0 || pet.cleanliness <= 0) {
      document.getElementById("pet").innerText = "💀";
      clearInterval(); // stop the loop
    }
  
    updateStats();
  }, 3000);
  
  updateStats();
  