/* ==========================================================================
   MACROSCOPIC SEOUL — main.js
   목차
   1. 헤더 스크롤 상태 & 모바일 메뉴
   2. Hero 자동 슬라이드
   3. 스크롤 리빌 애니메이션
   4. Landmark Scene Stack (등장 애니메이션 + Scene Rail)
   5. 갤러리 라이트박스
   6. 인터랙티브 지도
   7. 초기화
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 헤더 스크롤 상태 & 모바일 메뉴
   -------------------------------------------------------------------------- */
function initHeaderScrollState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const SCROLL_THRESHOLD = 40;

  const updateHeaderState = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

function initMobileMenu() {
  const menuToggleButton = document.getElementById("menuToggleButton");
  const navigationMenu = document.getElementById("navigationMenu");
  if (!menuToggleButton || !navigationMenu) return;

  const closeMenu = () => {
    navigationMenu.classList.remove("is-open");
    menuToggleButton.classList.remove("is-active");
    menuToggleButton.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = navigationMenu.classList.toggle("is-open");
    menuToggleButton.classList.toggle("is-active", isOpen);
    menuToggleButton.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggleButton.addEventListener("click", toggleMenu);

  navigationMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/* --------------------------------------------------------------------------
   2. Hero 자동 슬라이드
   -------------------------------------------------------------------------- */
function initHeroSlideshow() {
  const prevButton = document.getElementById("heroPrevButton");
  const nextButton = document.getElementById("heroNextButton");

  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-slide-dot");
  if (slides.length === 0) return;

  const SLIDE_INTERVAL_MS = 6000;
  let currentIndex = 0;
  let autoplayTimer = null;

  const goToSlide = (targetIndex) => {
    slides[currentIndex].classList.remove("is-active");
    dots[currentIndex]?.classList.remove("is-active");

    currentIndex = (targetIndex + slides.length) % slides.length;

    slides[currentIndex].classList.add("is-active");
    dots[currentIndex]?.classList.add("is-active");
  };

  const startAutoplay = () => {
    autoplayTimer = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, SLIDE_INTERVAL_MS);
  };

  const restartAutoplay = () => {
    window.clearInterval(autoplayTimer);
    startAutoplay();
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slideIndex);
      goToSlide(targetIndex);
      restartAutoplay();
    });
  });

  startAutoplay();

  prevButton?.addEventListener("click", () => {
    goToSlide(currentIndex - 1);

    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    goToSlide(currentIndex + 1);

    restartAutoplay();
  });
}

/* --------------------------------------------------------------------------
   3. 스크롤 리빌 애니메이션
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(".reveal-on-scroll");
  if (revealTargets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  revealTargets.forEach((target) => observer.observe(target));
}

/* --------------------------------------------------------------------------
   4. Landmark Scene Stack (등장 애니메이션 + Scene Rail)
   -------------------------------------------------------------------------- */
function initLandmarkScenes() {
  const landmarksSection = document.getElementById("landmarks");
  const scenes = document.querySelectorAll(".landmark-scene");
  const sceneRail = document.getElementById("sceneRail");
  const railDots = document.querySelectorAll(".scene-rail-dot");
  console.log("Landmark 실행");

  if (!landmarksSection || scenes.length === 0) return;

  // 각 장면(scene)이 화면에 들어오면 이미지/캡션 등장 애니메이션 실행
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.3,
    },
  );

  scenes.forEach((scene) => sceneObserver.observe(scene));

  // Landmarks 섹션 안에 있을 때만 Scene Rail 노출
  if (sceneRail) {
    const railVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sceneRail.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.1 },
    );

    railVisibilityObserver.observe(landmarksSection);
  }

  // 현재 뷰포트 중앙에 가장 가까운 장면에 맞춰 Rail의 활성 dot 갱신
  const activeSceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // console.log(entry.target.id, entry.isIntersecting);

        if (!entry.isIntersecting) return;

        const sceneId = entry.target.id;

        railDots.forEach((dot) => {
          dot.classList.toggle("is-active", dot.dataset.target === sceneId);
        });
      });
    },
    {
      threshold: 0.5,
    },
  );
  scenes.forEach((scene) => activeSceneObserver.observe(scene));

  // Rail dot 클릭 시 해당 장면으로 스크롤 이동
  railDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetScene = document.getElementById(dot.dataset.target);
      targetScene?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

/* --------------------------------------------------------------------------
   5. 갤러리 라이트박스
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightboxOverlay = document.getElementById("lightboxOverlay");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeButton = document.getElementById("lightboxCloseButton");
  const prevButton = document.getElementById("lightboxPrevButton");
  const nextButton = document.getElementById("lightboxNextButton");

  if (galleryItems.length === 0 || !lightboxOverlay) return;

  let activeIndex = 0;

  const renderSlide = (index) => {
    const item = galleryItems[index];
    const fullImageUrl = item.dataset.full;
    const captionText =
      item.querySelector(".gallery-item-caption")?.textContent ?? "";

    lightboxImage.src = fullImageUrl;
    lightboxImage.alt = captionText;
    lightboxCaption.textContent = captionText;
  };

  const openLightbox = (index) => {
    activeIndex = index;
    renderSlide(activeIndex);
    lightboxOverlay.hidden = false;
    requestAnimationFrame(() => lightboxOverlay.classList.add("is-visible"));
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightboxOverlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      lightboxOverlay.hidden = true;
    }, 300);
  };

  const showNextSlide = () => {
    activeIndex = (activeIndex + 1) % galleryItems.length;
    renderSlide(activeIndex);
  };

  const showPrevSlide = () => {
    activeIndex = (activeIndex - 1 + galleryItems.length) % galleryItems.length;
    renderSlide(activeIndex);
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeButton.addEventListener("click", closeLightbox);
  nextButton.addEventListener("click", showNextSlide);
  prevButton.addEventListener("click", showPrevSlide);

  lightboxOverlay.addEventListener("click", (event) => {
    if (event.target === lightboxOverlay) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightboxOverlay.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNextSlide();
    if (event.key === "ArrowLeft") showPrevSlide();
  });
}

/* --------------------------------------------------------------------------
   6. 인터랙티브 지도
   -------------------------------------------------------------------------- */
const LANDMARK_DETAILS = {
  bukchon: {
    title: "북촌한옥마을",
    address: "서울특별시 종로구 계동길 37",
    transit: "3호선 안국역 2번 출구, 도보 5분",
    description:
      "600년 역사를 간직한 전통 한옥 마을로, 골목마다 서울의 옛 정취가 남아있습니다.",
  },
  gyeongbokgung: {
    title: "경복궁",
    address: "서울특별시 종로구 사직로 161",
    transit: "3호선 경복궁역 5번 출구, 도보 3분",
    description:
      "조선 왕조의 법궁으로, 근정전과 경회루 등 웅장한 전통 건축을 만날 수 있습니다.",
  },
  ddp: {
    title: "DDP 동대문디자인플라자",
    address: "서울특별시 중구 을지로 281",
    transit: "2·4·5호선 동대문역사문화공원역 1번 출구 직결",
    description:
      "자하 하디드가 설계한 곡선형 건축물로, 전시와 패션 행사가 열리는 복합 문화공간입니다.",
  },
  namsan: {
    title: "남산서울타워",
    address: "서울특별시 용산구 남산공원길 105",
    transit: "4호선 명동역 하차 후 남산 케이블카 이용",
    description:
      "서울 전경을 한눈에 담을 수 있는 전망대로, 야경 명소로 특히 사랑받습니다.",
  },
  cheonggyecheon: {
    title: "청계천",
    address: "서울특별시 종로구 청계천로 일대",
    transit: "1호선 종각역 4번 출구, 도보 2분",
    description:
      "도심을 가로지르는 복원 하천으로, 산책로를 따라 계절마다 다른 풍경을 보여줍니다.",
  },
  seoullo: {
    title: "서울로7017",
    address: "서울특별시 중구 청파로 432",
    transit: "1·4호선 서울역 2번 출구 직결",
    description:
      "고가도로를 재생한 공중정원으로, 다양한 수목과 함께 도심 산책을 즐길 수 있습니다.",
  },
};

function initInteractiveMap() {
  const mapPins = document.querySelectorAll(".map-pin");
  const placeholder = document.getElementById("mapInfoPlaceholder");
  const infoContent = document.getElementById("mapInfoContent");
  const infoTitle = document.getElementById("mapInfoTitle");
  const infoAddress = document.getElementById("mapInfoAddress");
  const infoTransit = document.getElementById("mapInfoTransit");
  const infoDescription = document.getElementById("mapInfoDescription");

  if (mapPins.length === 0) return;

  const selectLandmark = (landmarkKey, selectedPin) => {
    const details = LANDMARK_DETAILS[landmarkKey];
    if (!details) return;

    mapPins.forEach((pin) => pin.classList.remove("is-active"));
    selectedPin.classList.add("is-active");

    infoTitle.textContent = details.title;
    infoAddress.textContent = details.address;
    infoTransit.textContent = details.transit;
    infoDescription.textContent = details.description;

    placeholder.hidden = true;
    infoContent.hidden = false;
  };

  mapPins.forEach((pin) => {
    pin.addEventListener("click", () => {
      selectLandmark(pin.dataset.landmark, pin);
    });
  });
}

/* --------------------------------------------------------------------------
   7. 초기화
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initHeaderScrollState();
  initMobileMenu();
  initHeroSlideshow();
  initScrollReveal();
  initLandmarkScenes();
  initGalleryLightbox();
  initInteractiveMap();
});

/* --------------------------------------------------------------------------
  8. 숫자로보는 서울
  -------------------------------------------------------------------------- */
const counters = document.querySelectorAll("[data-count-to]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const counter = entry.target;

      if (entry.isIntersecting) {
        // 이미 실행 중이면 중복 실행 방지
        if (!counter.classList.contains("is-counting")) {
          counter.classList.add("is-counting");
          animateCounter(counter);
        }
      } else {
        // 화면 밖으로 나가면 초기화
        counter.classList.remove("is-counting");
        counter.textContent = "0" + (counter.dataset.suffix || "");
      }
    });
  },
  {
    threshold: 0.5,
  },
);

counters.forEach((counter) => observer.observe(counter));

function animateCounter(element) {
  const target = Number(element.dataset.countTo);
  const suffix = element.dataset.suffix || "";

  const duration = 2500;
  const startTime = performance.now();

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = easeOutExpo(progress);

    const current = target * eased;

    element.textContent = Math.round(current).toLocaleString() + suffix;

    if (progress < 1 && element.classList.contains("is-counting")) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
