# 쇼핑 리스트 앱

순수 HTML/CSS/JavaScript로 만든 쇼핑 리스트 웹 앱입니다.  
서버 없이 브라우저에서 바로 실행되며, 데이터는 localStorage에 저장됩니다.

---

## 실행 방법

> **메인 파일: `index.html`**

1. 이 저장소를 클론하거나 `index.html` 파일을 다운로드합니다.
2. `index.html` 파일을 **더블클릭**하거나, 브라우저에 드래그 앤 드롭합니다.
3. 별도의 서버나 설치 없이 바로 사용할 수 있습니다.

```bash
# 저장소 클론 후 바로 열기
git clone https://github.com/edensays/shopping-list-app.git
cd shopping-list-app
open index.html   # macOS
start index.html  # Windows
```

---

## 기능

- 아이템 추가 (버튼 클릭 또는 Enter 키)
- 완료/미완료 체크 토글
- 아이템 삭제
- 전체/미완료/완료 필터
- 완료 항목 일괄 삭제
- 통계 표시 (총/완료/미완료 개수)
- localStorage를 통한 데이터 영속성 (새로고침해도 유지)

---

## 테스트 실행

Playwright 기반 자동화 테스트 (`shopping-list.test.mjs`)를 포함합니다.

```bash
npm install
node shopping-list.test.mjs
```

총 24개 테스트 항목을 검증합니다.
