/* ==========================================================================
   MACROSCOPIC SEOUL — main.js
   목차
   1. 헤더 스크롤 상태 & 모바일 메뉴
   1-1. 헤더 Active Navigation Indicator
   1-2. 헤더 Season Badge (더미 데이터)
   2. Hero 자동 슬라이드
   3. 스크롤 리빌 애니메이션
   4. Landmark Scene Stack (등장 애니메이션 + Scene Rail)
   5. 갤러리 라이트박스
   6. 인터랙티브 지도
   7. Seoul by Numbers (카운터 애니메이션)
   8. 초기화
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 헤더 스크롤 상태 & 모바일 메뉴
   -------------------------------------------------------------------------- */
function initHeaderScrollEffects() {
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("headerScrollProgress");
  if (!header) return;

  const SCROLL_THRESHOLD = 40;
  let ticking = false;

  const updateHeaderOnScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);

    if (progressBar) {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progressPercent =
        scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      progressBar.style.width = `${progressPercent}%`;
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeaderOnScroll);
  };

  updateHeaderOnScroll();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
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
   1-1. 헤더 Active Navigation Indicator
   현재 스크롤 중인 섹션에 맞춰 슬라이딩 바를 nav-link 아래로 이동시킨다.
   -------------------------------------------------------------------------- */
function initActiveNavIndicator() {
  const navigationMenu = document.getElementById("navigationMenu");
  const indicator = document.getElementById("navActiveIndicator");
  const navLinks = Array.from(
    document.querySelectorAll(".nav-link[data-section-link]"),
  );

  if (!navigationMenu || !indicator || navLinks.length === 0) return;

  const trackedSections = navLinks
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);

  const moveIndicatorToLink = (targetLink) => {
    if (!targetLink) return;

    const navRect = navigationMenu.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
    indicator.classList.add("is-visible");

    navLinks.forEach((link) =>
      link.classList.toggle("is-active", link === targetLink),
    );
  };

  // 초기 활성 상태: 홈
  moveIndicatorToLink(navLinks[0]);

  const updateActiveSection = () => {
    const trigger = window.innerHeight * 0.35;

    let currentSection = trackedSections[0];

    trackedSections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= trigger && rect.bottom >= trigger) {
        currentSection = section;
      }
    });

    const matchingLink = navLinks.find(
      (link) => link.dataset.sectionLink === currentSection.id,
    );

    if (matchingLink) {
      moveIndicatorToLink(matchingLink);
    }
  };

  // Observer는 스크롤 변화 감지만 담당
  const sectionObserver = new IntersectionObserver(() => {
    updateActiveSection();
  });

  trackedSections.forEach((section) => sectionObserver.observe(section));

  // 스크롤 시 현재 섹션 갱신
  window.addEventListener("scroll", updateActiveSection, { passive: true });

  // 리사이즈 시 현재 섹션 + 인디케이터 위치 갱신
  window.addEventListener("resize", () => {
    updateActiveSection();

    const activeLink = navLinks.find((link) =>
      link.classList.contains("is-active"),
    );

    moveIndicatorToLink(activeLink);
  });

  // 첫 실행
  updateActiveSection();
}

/* --------------------------------------------------------------------------
   1-2. 헤더 Season Badge (더미 데이터)
   현재 월을 기준으로 계절과 대표 축제를 헤더에 표시한다.
   -------------------------------------------------------------------------- */
function initSeasonBadge() {
  const seasonBadge = document.getElementById("headerSeasonBadge");
  const seasonTextElement = document.getElementById("headerSeasonText");
  if (!seasonBadge || !seasonTextElement) return;

  const SEASONS_BY_MONTH = [
    { months: [3, 4, 5], label: "SPRING · 여의도 봄꽃축제" },
    { months: [6, 7, 8], label: "SUMMER · 한강 서머페스티벌" },
    { months: [9, 10, 11], label: "AUTUMN · 서울등불축제" },
    { months: [12, 1, 2], label: "WINTER · 서울 크리스마스 마켓" },
  ];

  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = SEASONS_BY_MONTH.find((season) =>
    season.months.includes(currentMonth),
  );

  if (currentSeason) {
    seasonTextElement.textContent = currentSeason.label;
  }

  // 배지를 누르면 해당 계절 축제가 있는 Festival 섹션으로 이동
  seasonBadge.addEventListener("click", () => {
    document.getElementById("festival")?.scrollIntoView({ behavior: "smooth" });
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
  const video = document.querySelector(".hero-video");
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

    updateHeroLocation(currentIndex);
    if (video) {
      if (currentIndex === 0) {
        video.currentTime = 0;
        video.play();

        window.clearInterval(autoplayTimer);
      } else {
        video.pause();

        window.clearInterval(autoplayTimer);
        startAutoplay();
      }
    }
  };

  const startAutoplay = () => {
    window.clearInterval(autoplayTimer);

    // 첫 번째 슬라이드에서는 자동 넘김 금지
    if (currentIndex === 0) return;

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

  // 슬라이드 처음 상태 설정
  goToSlide(0);

  startAutoplay();

  // 영상 끝나면 다음 슬라이드
  if (video) {
    video.addEventListener("ended", () => {
      goToSlide(1);
      startAutoplay();
    });
  }

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
        if (!entry.isIntersecting) return;

        const sceneId = entry.target.id;

        railDots.forEach((dot) => {
          dot.classList.toggle("is-active", dot.dataset.target === sceneId);
        });
        hero - overlay;
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
   7. Seoul by Numbers (카운터 애니메이션)
   -------------------------------------------------------------------------- */
function animateCounter(element) {
  const target = Number(element.dataset.countTo);
  const suffix = element.dataset.suffix || "";
  const DURATION_MS = 2500;
  const startTime = performance.now();

  const easeOutExpo = (progress) =>
    progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

  const updateFrame = (now) => {
    const progress = Math.min((now - startTime) / DURATION_MS, 1);
    const currentValue = target * easeOutExpo(progress);
    element.textContent = Math.round(currentValue).toLocaleString() + suffix;

    if (progress < 1 && element.classList.contains("is-counting")) {
      requestAnimationFrame(updateFrame);
    }
  };

  requestAnimationFrame(updateFrame);
}

function initStatCounters() {
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length === 0) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const counter = entry.target;

        if (entry.isIntersecting) {
          if (!counter.classList.contains("is-counting")) {
            counter.classList.add("is-counting");
            animateCounter(counter);
          }
        } else {
          // 화면 밖으로 나가면 다음 진입 시 재생을 위해 초기화
          counter.classList.remove("is-counting");
          counter.textContent = "0" + (counter.dataset.suffix || "");
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* --------------------------------------------------------------------------
   8. 초기화
   하나의 init 함수가 실패해도 나머지 기능이 함께 멈추지 않도록
   각 호출을 개별적으로 격리해서 실행한다.
   -------------------------------------------------------------------------- */
function runSafely(initFn) {
  try {
    initFn();
  } catch (error) {
    console.error(`[MACROSCOPIC SEOUL] ${initFn.name} 초기화 실패:`, error);
  }
}

/* =====================================================
   HERO LOCATION CARD
===================================================== */
function updateHeroLocation(index) {
  console.log(index); // 확인용

  const data = HERO_LOCATIONS[index];
  const card = document.getElementById("heroLocationCard");
  const herooverlay = document.getElementById("hero-overlay");

  // 첫 번째(영상) 슬라이드에서는 카드 숨김
  if (index === 0) {
    card.style.display = "none";
    herooverlay.style.display = "none";
    return;
  }

  // 나머지 슬라이드에서는 다시 표시
  card.style.display = "block";
  herooverlay.style.display = "block";

  document.getElementById("heroLocationTitle").textContent = data.title;
  document.getElementById("heroLocationSubtitle").textContent = data.subtitle;
  document.getElementById("heroLocationDescription").textContent =
    data.description;

  // document.getElementById("heroLocationNumber").textContent = String(
  //   index + 1,
  // ).padStart(2, "0");
}

const HERO_LOCATIONS = [
  {
    title: "Cheonggyecheon",
    subtitle: "청계천",
    description: "도심 속을 흐르는 서울의 대표적인 수변공간",
  },
  {
    title: "Cheonggyecheon",
    subtitle: "청계천",
    description: "도심 속을 흐르는 서울의 대표적인 수변공간",
  },

  {
    title: "Dongdaemun Design Plaza",
    subtitle: "DDP",
    description: "미래적인 곡선이 돋보이는 서울의 랜드마크",
  },

  {
    title: "Gyeongbokgung",
    subtitle: "경복궁",
    description: "조선 왕조의 법궁이자 서울의 대표 문화유산",
  },

  {
    title: "Hangang Park",
    subtitle: "한강공원",
    description: "서울 시민들의 휴식과 축제가 함께하는 공간",
  },

  {
    title: "Hangang spring",
    subtitle: "한강의 봄",
    description: "봄 되면 벗꽃이 많이 펴 더욱 이쁜 서울의 한강",
  },

  {
    title: "Bukchon Hanok Village",
    subtitle: "북촌한옥마을",
    description: "전통적인 한옥이 갖고 있는 유형적 성격을 잃지 않은 도시주택",
  },

  {
    title: "Seoul Sky 7017",
    subtitle: "서울 야경",
    description:
      "서울로 7017은 17개의 사람길로 구성이 되어있음 주변 지역을 연결하여 재생한다는 것이 특징",
  },
];

// 갤러리부분 프레임이미지
document.querySelectorAll(".gallery-item").forEach((item) => {
  const img = item.querySelector("img");

  if (img) {
    item.dataset.full = img.src;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  [
    initHeaderScrollEffects,
    initMobileMenu,
    initActiveNavIndicator,
    initSeasonBadge,
    initHeroSlideshow,
    initScrollReveal,
    initLandmarkScenes,
    initGalleryLightbox,
    initInteractiveMap,
    initStatCounters,
  ].forEach(runSafely);
});
