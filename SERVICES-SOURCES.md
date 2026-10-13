# 서비스 페이지 개선 · 2026-10-13

- 구성·흐름 참고: https://toss.im/service/asset-management
- 큰 제목과 대표 이미지 → 번호가 붙은 핵심 설명 → 세부 특징 탭 → 상담 준비와 과정 → FAQ → 상담 및 다른 서비스 연결.
- 기존 네모 서비스 문구와 항목, FAQ를 유지·재구성. 타사의 수치·금융 기능·후기·가격 또는 보장 내용을 추가하지 않음.
- `service-content.json`은 6개 서비스의 내용, `scripts/build-service-pages.cjs`는 정적 페이지 구성 소스.
- `dist/assets/services/{residential,commercial,office,popup,branding,styling}.png`: 이 대화에서 내장 이미지 생성 도구로 제작한 서비스별 콘셉트 이미지. 실제 시공 실적이 아님. 서비스 소개용으로 사용하며 포트폴리오 실적에 등록하지 않음.
- 프롬프트 원문은 `service-image-prompts.json`에 보관. 외부 사진을 복제하거나 타사 로고를 사용하지 않음.
- 기존 반투명 상단 메뉴와 스크롤 방향 동작 유지. 모바일 대응, 탭 방향키·Home·End, 모션 감소 설정, FAQ 펼쳐보기 지원.
