document.addEventListener('DOMContentLoaded', () => {

  // 1. Инициализация Lenis (Скролл)
  //
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
  });
  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 2. Мобильное меню
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const links = document.querySelectorAll('.header__link');

  if (burger) {
      burger.addEventListener('click', () => {
          nav.classList.toggle('active');
          burger.classList.toggle('active');
      });
      links.forEach(l => l.addEventListener('click', () => {
          nav.classList.remove('active');
          burger.classList.remove('active');
      }));
  }

  // 3. Three.js Hero
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      canvas.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const count = 300;
      const posArray = new Float32Array(count * 3);
      for(let i=0; i<count*3; i++) posArray[i] = (Math.random()-0.5)*10;
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const material = new THREE.PointsMaterial({size: 0.04, color: 0x3B82F6});
      const mesh = new THREE.Points(geometry, material);
      scene.add(mesh);
      camera.position.z = 5;

      function animate() {
          requestAnimationFrame(animate);
          mesh.rotation.y += 0.002;
          renderer.render(scene, camera);
      }
      animate();
  }

  // 4. Логика Формы
  const form = document.getElementById('leadForm');
  const successMsg = document.getElementById('formSuccess');

  // Мат. капча
  const n1 = Math.floor(Math.random() * 5) + 1;
  const n2 = Math.floor(Math.random() * 5) + 1;
  const captchaLabel = document.getElementById('captchaLabel');
  const captchaInput = document.getElementById('captchaInput');
  if(captchaLabel) captchaLabel.textContent = `Сколько будет ${n1} + ${n2}?`;

  if (form) {
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          let isValid = true;

          document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
          document.querySelector('.form-checkbox').classList.remove('error');

          const name = document.getElementById('name');
          if (name.value.length < 2) {
              name.parentElement.classList.add('error');
              isValid = false;
          }

          const email = document.getElementById('email');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
              email.parentElement.classList.add('error');
              isValid = false;
          }

          const phone = document.getElementById('phone');
          if (!/^[0-9+ ]{7,15}$/.test(phone.value)) {
              phone.parentElement.classList.add('error');
              isValid = false;
          }

          if (parseInt(captchaInput.value) !== (n1 + n2)) {
              captchaInput.parentElement.classList.add('error');
              isValid = false;
          }

          const policy = document.getElementById('policy');
          if (!policy.checked) {
              policy.parentElement.classList.add('error');
              isValid = false;
          }

          if (isValid) {
              const btn = form.querySelector('button[type="submit"]');
              btn.textContent = 'Отправка...';
              btn.disabled = true;

              setTimeout(() => {
                  form.style.display = 'none';
                  successMsg.style.display = 'block';
                  console.log('Lead sent');
              }, 1000);
          }
      });
  }

  // 5. Swiper (Блог)
  new Swiper('.blog-slider', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
      }
  });

  // 6. Аккордеон FAQ
  document.querySelectorAll('.faq__item').forEach(item => {
      item.querySelector('.faq__question').addEventListener('click', () => {
          item.classList.toggle('active');
      });
  });

  // 7. Cookie
  const cookiePopup = document.getElementById('cookiePopup');
  if (cookiePopup && !localStorage.getItem('omiq_cookies')) {
      setTimeout(() => cookiePopup.classList.add('show'), 2000);
      document.getElementById('acceptCookie').addEventListener('click', () => {
          localStorage.setItem('omiq_cookies', 'true');
          cookiePopup.classList.remove('show');
      });
  }
});

// --- АНИМАЦИИ GSAP ---
window.addEventListener('load', () => {

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.refresh();

      // Анимация Hero
      gsap.from('.hero__content', {
          y: 30,
          opacity: 0,
          duration: 1,
          delay: 0.2
      });

      // Заголовки секций
      gsap.utils.toArray('.section-title').forEach(title => {
          gsap.from(title, {
              scrollTrigger: {
                  trigger: title,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse'
              },
              y: 30,
              opacity: 0,
              duration: 0.8
          });
      });

      // --- ИСПРАВЛЕННЫЙ БЛОК ДЛЯ СЕТОК (BENEFITS, INNOVATIONS, PRACTICES) ---
      // Мы явно выбираем контейнеры
      const containers = document.querySelectorAll('.benefits__grid, .innovations__scroller, .practices__wrapper');

      containers.forEach(container => {
          // Проверяем, есть ли дети внутри контейнера
          if (container.children.length > 0) {

              // 1. Превращаем "детей" в настоящий массив (важно для корректной работы stagger)
              const items = Array.from(container.children);

              // 2. Запускаем анимацию
              gsap.from(items, {
                  scrollTrigger: {
                      trigger: container, // Триггер - сам контейнер
                      start: 'top 85%',   // Запуск, когда верх блока появится внизу экрана
                      // markers: true,   // Раскомментируй для отладки, если не сработает
                  },
                  y: 50,          // Элементы выезжают снизу
                  opacity: 0,     // Из прозрачности
                  duration: 0.8,
                  stagger: 0.2,   // Задержка 0.2 сек между каждым элементом списка
                  clearProps: "all" // ОЧЕНЬ ВАЖНО: Удаляет инлайн-стили после анимации, чтобы не ломать верстку
              });
          }
      });
  }
});