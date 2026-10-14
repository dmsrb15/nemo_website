# 서비스 페이지 개선 · 2026-10-13

## 2026-10-14 다른 서비스 후속 정리
- 상업·사무·팝업·브랜딩·스타일링 본문을 간결하게 정리. `service-refinements.json`에서 서비스별 핵심 설명과 네 단계 과정을 유지.
- 주거와 동일한 전체 화면 진행 과정, 세로 카드 순차 등장, 투명 기호 아이콘 적용. 팝업은 운영, 브랜딩·스타일링은 적용 후 조정으로 문구를 맞춤.
- 상업 대표 사진 `commercial-service-v3.png`: 사용자와 최근 제작한 고객에게 종이봉투를 건네는 AI 콘셉트. 원본 exec-2207e3ac-a08d-4334-b269-b4f77e7ca65a.png, 실제 시공 실적이 아님. 기존 넓은 매장 사진은 보존.
- 상담 분류 링크와 FAQ 유지. 단계 색상·모션은 공유 CSS/JS로 관리.

## 2026-10-14 Figma 주거 예시 반영
- 참고: https://www.figma.com/design/P7fY76UPOliY30xqioZ8Ng/ node 0:1. 소재를 만지는 사진은 화면에서 제거.
- 기존 네모 `home-3d-v2.png`를 재사용해 집 일러스트와 생활·취향·동선 요소의 순차 등장 구성. 견적 설명은 좌측 제목과 우측 설명·이미지의 편집식 배치.
- 함께하는 과정은 3장 카드와 오른쪽 아래 3D 기호 아이콘으로 구성. 사람 아이콘을 원하지 않는 사용자 지시에 따라 말풍선·도면·집과 체크를 사용.
- `process-listen.png`, `process-design.png`, `process-complete.png`: 이 대화에서 내장 이미지 생성 도구로 만든 투명 배경 이미지. 프롬프트는 `residential-symbol-prompts.json`. 타사 로고나 금융 화면을 사용하지 않음.
- 순차 페이드인과 아이콘 등장, 모션 감소 대응. 다른 서비스 구성 유지.

## 2026-10-14 주거 본문 정리
- 사용자 요청대로 반복된 문장과 동선·수납 소제목 삭제. 생활 방식과 색·소재·질감·빛 내용을 집의 중심 섹션에 병합.
- `residential-material-touch.png`: 인물 일부와 손, 패브릭·원목을 가까이 담은 새 AI 콘셉트 이미지. 회사소개 상담 사진을 중성 색감·질감 참고로 사용. 실제 실적 아님. 원문은 `residential-material-prompt.json`.
- 주거 사진 3곳에 미세 확대가 풀리는 등장 효과, 본문에는 130ms 순차 등장 적용. 모션 감소 설정 대응. 다른 서비스 내용·사진 유지.

## 서비스 전체 정렬·사진·내용 후속 개선
- 사용자가 제공한 토스 서비스 상단 스크린샷을 기준으로 좌측 분류·제목, 우측 짧은 설명의 아래 높이를 맞추고 아래 대표 사진과 양끝을 정렬. 모바일은 제목·설명·사진 순서로 배치.
- 주거의 승인된 생활 사진을 유지하고, 다른 5개 서비스는 내장 이미지 생성 도구로 사람이 공간을 사용하는 장면을 신규 제작. `dist/assets/services/*-life-v2.png`는 서비스 소개용 AI 콘셉트이며 실제 실적이 아님.
- 색감·질감 참고: 네모 회사소개 `about-consultation.png`. 생성 원문: `service-lifestyle-prompts.json`. 기존 자산은 보존.
- 서비스 내용은 네모 `content.js`, 기존 서비스 설명 및 회사소개에서 재구성. 상업의 고객 경험·운영, 사무의 집중·협업, 팝업의 방문 흐름·설치 조건, 브랜딩의 방향·접점, 스타일링의 기존 가구·질감·빛을 중심으로 구성.
- 기존 반복 이미지 탭을 세로 설명으로 교체. 모든 서비스에 동일한 순차 페이드인, 모션 감소 대응 및 FAQ 적용. 서비스 배경은 흰색·연한 회색이며 노란 그라데이션을 사용하지 않음.
- `scripts/build-service-pages.cjs`가 주거·다른 서비스의 전용 생성기를 호출. 전체 서비스 구성은 `build-residential.cjs`, `build-editorial-services.cjs`에서 유지.

## 주거 페이지 후속 개선
- `scripts/build-residential.cjs`: 주거 전용 구성. 큰 메시지 → 생활·동선·수납 → 취향·소재·빛 → 견적 기준 → 과정·FAQ·상담.
- 내용 출처: 네모 `dist/content.js`의 주거 공간, 소재, 첫 상담, 과정 글과 `dist/about.html`의 고객 중심·견적 기준. FAQ는 `service-content.json` 유지.
- `dist/assets/services/residential-life-v2.png`: 사용자와 함께 만든 주거 생활 콘셉트. Figma K9LZGe9EbKLMuw43fVWk6X의 생활 사진을 색감 참고로 신규 생성한 뒤, 네모 회사소개 `about-consultation.png`에 맞춰 중성적인 실내광과 미세 노이즈를 조정. 실제 시공 실적 사진 아님.
- `residential-detail.css/js`: 주거에만 적용. 노란 그라데이션 없이 흰색과 연한 회색 배경, 그룹 내 130ms 간격 등장, 모션 감소 지원. 다른 서비스는 다음 작업으로 유지.

- 구성·흐름 참고: https://toss.im/service/asset-management
- 큰 제목과 대표 이미지 → 번호가 붙은 핵심 설명 → 세부 특징 탭 → 상담 준비와 과정 → FAQ → 상담 및 다른 서비스 연결.
- 기존 네모 서비스 문구와 항목, FAQ를 유지·재구성. 타사의 수치·금융 기능·후기·가격 또는 보장 내용을 추가하지 않음.
- `service-content.json`은 6개 서비스의 내용, `scripts/build-service-pages.cjs`는 정적 페이지 구성 소스.
- `dist/assets/services/{residential,commercial,office,popup,branding,styling}.png`: 이 대화에서 내장 이미지 생성 도구로 제작한 서비스별 콘셉트 이미지. 실제 시공 실적이 아님. 서비스 소개용으로 사용하며 포트폴리오 실적에 등록하지 않음.
- 프롬프트 원문은 `service-image-prompts.json`에 보관. 외부 사진을 복제하거나 타사 로고를 사용하지 않음.
- 기존 반투명 상단 메뉴와 스크롤 방향 동작 유지. 모바일 대응, 탭 방향키·Home·End, 모션 감소 설정, FAQ 펼쳐보기 지원.
