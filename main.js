    const btn = document.getElementById('nice-btn');
    const counterEl = document.getElementById('counter');
    const card = document.getElementById('main-card');
    const quoteBox = document.getElementById('quote-box');

    const quotes = [
      "Sehr nice!",
      "Das ist ein guter Bauch.",
      "Stabil!",
      "Unglaubliches Level.",
      "Weiter so!",
      "Bauch-Gefühl: 10/10",
      "Qualitäts-Bauch.",
      "Legendär!",
      "Bauch-tastisch!",
      "Einfach nur WOW."
    ];

    let count = parseInt(localStorage.getItem('niceCount')) || 0;
    counterEl.textContent = count;

    btn.addEventListener('click', () => {
      count++;
      counterEl.textContent = count;
      localStorage.setItem('niceCount', count);

      // Trigger Confetti on milestones
      if (count % 10 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#60a5fa', '#c084fc', '#ffffff']
        });
      }

      // Animation
      card.classList.remove('pulse');
      void card.offsetWidth; // Trigger reflow
      card.classList.add('pulse');
      
      // Random Quote
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteBox.textContent = randomQuote;
      quoteBox.style.opacity = '1';

      // Reset animation
      setTimeout(() => {
        card.classList.remove('pulse');
      }, 400);
    });
