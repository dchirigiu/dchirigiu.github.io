/* ================================================
   PRELOADER & INTRO LOGIC
   ================================================ */

(function() {
  'use strict';
  
  const preloader = document.getElementById('preloader');
  const preloaderNumber = document.querySelector('#preloader-number div');
  
  // Simulate loading progress
  let progress = 0;
  const duration = 2000; // 2 seconds total
  const interval = 20; // Update every 20ms
  const steps = duration / interval;
  const increment = 100 / steps;
  
  const shouldShowIntro = document.documentElement.classList.contains('intro-play');
  
  if (shouldShowIntro) {
    const progressInterval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        setTimeout(hidePreloader, 400);
      }
      preloaderNumber.textContent = Math.round(progress) + '%';
    }, interval);
  } else {
    // Skip intro if already seen
    preloader.style.display = 'none';
  }
  
  function hidePreloader() {
    preloader.classList.add('preloader-exit');
    sessionStorage.setItem('intro-seen', 'true');
    setTimeout(() => {
      preloader.style.display = 'none';
      initScrollReveal();
    }, 800);
  }
  
  // If intro is skipped, init immediately
  if (!shouldShowIntro) {
    initScrollReveal();
  }
  
  /* ================================================
     SCROLL-TRIGGERED REVEAL
     ================================================ */
  
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    if (!reveals.length) return;
    
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    reveals.forEach(el => observer.observe(el));
  }
  
  /* ================================================
     SLIDER LOGIC
     ================================================ */
  
  const slider = document.getElementById('slider');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  
  if (slider && dots.length > 0) {
    let currentIndex = 0;
    const cards = slider.querySelectorAll('.project-card');
    const totalCards = cards.length;
    
    // Scroll to card
    function scrollToCard(index) {
      if (index < 0) index = 0;
      if (index >= totalCards) index = totalCards - 1;
      
      currentIndex = index;
      
      const card = cards[index];
      const scrollLeft = card.offsetLeft - (slider.offsetWidth / 2) + (card.offsetWidth / 2);
      
      slider.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      
      updateDots();
    }
    
    // Update dot indicators
    function updateDots() {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
    
    // Navigation buttons
    prevBtn?.addEventListener('click', () => {
      scrollToCard(currentIndex - 1);
    });
    
    nextBtn?.addEventListener('click', () => {
      scrollToCard(currentIndex + 1);
    });
    
    // Dot navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        scrollToCard(i);
      });
    });
    
    // Keyboard navigation
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToCard(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToCard(currentIndex + 1);
      }
    });
    
    // Detect scroll position for dots
    let scrollTimeout;
    slider.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollCenter = slider.scrollLeft + slider.offsetWidth / 2;
        
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(scrollCenter - cardCenter);
          
          if (distance < card.offsetWidth / 2) {
            if (currentIndex !== i) {
              currentIndex = i;
              updateDots();
            }
          }
        });
      }, 100);
    });
    
    // Touch/drag support with momentum
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let lastX = 0;
    let lastTime = Date.now();
    
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.style.cursor = 'grabbing';
      slider.style.scrollBehavior = 'auto';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      velocity = 0;
      lastX = e.pageX;
      lastTime = Date.now();
    });
    
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollBehavior = 'smooth';
    });
    
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollBehavior = 'smooth';
      
      // Apply momentum
      if (Math.abs(velocity) > 2) {
        const momentum = velocity * 8;
        slider.scrollBy({
          left: momentum,
          behavior: 'smooth'
        });
      }
    });
    
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
      
      // Calculate velocity
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (e.pageX - lastX) / dt;
      }
      lastX = e.pageX;
      lastTime = now;
    });
    
    // Initialize
    updateDots();
    slider.style.cursor = 'grab';
  }
  
  /* ================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ================================================ */
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#main') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
})();
