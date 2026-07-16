# MACROSCOPIC SEOUL (Light Theme)

서울의 대표 랜드마크와 계절별 축제를 소개하는 프리미엄 관광 브랜드 사이트입니다. Apple / Tesla / Polestar의 스크롤 스토리텔링과 절제된 UI를 서울이라는 주제에 맞게 재해석했습니다.

## 폴더 구조

```
macroscopic-seoul/
├── index.html          시맨틱 HTML 마크업
├── css/
│   └── style.css       디자인 토큰 기반 스타일시트 (라이트 테마)
├── js/
│   └── main.js          기능별 모듈 스크립트
├── images/               (실 서비스 이미지 배치용 폴더)
│   ├── hero/
│   ├── landmarks/
│   ├── festival/
│   └── gallery/
└── icons/                (index.html 내 인라인 SVG 스프라이트로 대체 사용)
```

## 실행 방법

```bash
cd macroscopic-seoul
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속. 별도 빌드 과정 없이 `index.html`을 바로 열어도 동작합니다.

## 디자인 변경 사항 (Dark → Light)

| 항목 | 이전 (Dark) | 현재 (Light) |
|---|---|---|
| Background | `#0F1115` | `#F6F6F3` (웜 뉴트럴 오프화이트) |
| Panel/Card | `rgba(255,255,255,.04)` | `#FFFFFF` + 은은한 그림자(`--shadow-card`) |
| Primary Text | `#F0F2F5` | `#14161A` |
| Secondary Text | `rgba(240,242,245,.75)` | `rgba(20,22,26,.62)` |
| Accent / Sub Accent | `#D92037` / `#2A4B8C` | 동일 유지 (라이트 배경에서도 대비 확보) |
| 카드 경계 표현 | 반투명 테두리 | 흰 배경 + 그림자 중심 |

## Featured Landmarks 구조 변경

브리프의 "카드보다 이미지 중심 섹션 우선" 요구에 따라, 이전 버전의 3열 카드 그리드를 **풀블리드 alternating scene 6개**로 재구성했습니다 (Polestar 에디토리얼 스타일). 각 장면은 이미지 절반 + 캡션 절반으로 구성되며, 좌우가 번갈아 배치됩니다.

**시그니처 요소 — Scene Rail**: Landmarks 섹션에 진입하면 화면 우측에 얇은 인디케이터가 나타나 현재 감상 중인 장소명을 표시합니다. 클릭 시 해당 장면으로 부드럽게 스크롤 이동하며, Landmarks 섹션을 벗어나면 자동으로 사라집니다. (`js/main.js`의 `initLandmarkScenes` 참고)

Festival 섹션은 브리프가 "카드 UI"를 명시했으므로 카드 그리드 구조를 유지하고, 라이트 테마로만 전환했습니다.

## 이미지 교체 안내 (중요)

현재 모든 사진은 `picsum.photos` 시드 기반 플레이스홀더입니다. 저작권 있는 실제 서울 사진을 임의로 사용할 수 없어 데모용으로 대체했습니다.

| 위치 | 현재 소스 패턴 | 교체 시 저장 경로(권장) |
|---|---|---|
| Hero 슬라이드 4장 | `picsum.photos/seed/seoul-morning-skyline` 등 | `images/hero/` |
| 랜드마크 Scene 6장 | `picsum.photos/seed/bukchon-hanok-wide` 등 | `images/landmarks/` |
| 축제 카드 4장 | `picsum.photos/seed/yeouido-cherry-blossom-day` 등 | `images/festival/` |
| 갤러리 10장 | `picsum.photos/seed/gallery-day-01` 등 | `images/gallery/` |
| 지도 배경 1장 | `picsum.photos/seed/seoul-map-illustration-light` | `images/` |

교체 시 `index.html`의 `src` 속성을 로컬 경로(`images/landmarks/bukchon.jpg` 등)로 수정하면 됩니다.

## 아이콘 & 폰트

- 아이콘: `index.html` 상단 `<svg style="display:none">` 스프라이트로 인라인 정의, `<use href="#icon-...">`로 재사용 (외부 CDN 요청 없음)
- 폰트: **Poppins**(Google Fonts, 영문/헤딩) + **Pretendard**(jsDelivr, 한글 본문)

## 주요 기능 (js/main.js)

- `initHeaderScrollState` — 스크롤 시 헤더 배경(투명→화이트 블러) 전환
- `initMobileMenu` — 모바일 햄버거 메뉴 토글
- `initHeroSlideshow` — Hero 배경 자동 슬라이드(6초 간격) + 인디케이터
- `initScrollReveal` — 일반 섹션 스크롤 리빌 애니메이션
- `initLandmarkScenes` — Scene 등장 애니메이션(fade+scale) + Scene Rail 표시/활성화/클릭 이동
- `initGalleryLightbox` — 갤러리 라이트박스(이전/다음/ESC)
- `initInteractiveMap` — 지도 핀 클릭 시 랜드마크 상세 정보 갱신

## 디자인 토큰 (css/style.css 상단 `:root`)

| 항목 | 값 |
|---|---|
| Background (Canvas) | `#F6F6F3` |
| Surface (Panel) | `#FFFFFF` |
| Primary Text | `#14161A` |
| Accent | `#D92037` |
| Sub Accent | `#2A4B8C` |
| Max Width | `1400px` |
| Section Padding | `160px` (모바일 `110px`) |
| Card Radius | `20px` |
| Button Radius | `999px` |

## 반응형 브레이크포인트

- Desktop: 기본
- Tablet: `max-width: 1180px`
- Mobile: `max-width: 900px` (Landmark Scene은 이미지+캡션 세로 스택으로 전환, Scene Rail은 숨김), `max-width: 560px`

## 접근성

- `prefers-reduced-motion` 대응
- 모든 인터랙티브 요소에 `aria-label` 지정
- 키보드 포커스 가능한 네이티브 `<button>` 사용
