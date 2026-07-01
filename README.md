# 메가커피 교직원 단체 주문 웹앱

교직원이 휴대폰으로 접속해 음료를 주문하고, 관리자가 실시간 주문 목록·메뉴별 집계·총 금액·CSV 다운로드를 확인할 수 있는 Firebase 연동 웹앱입니다.

## 들어 있는 기능

- 이름 입력
- 음료 메뉴 선택
- 메뉴 검색
- HOT / ICE 선택
- 사이즈 선택
- 옵션 선택: 샷 추가, 시럽 추가, 휘핑 추가, 얼음 적게
- 요청사항 입력
- 주문 제출
- 관리자 비밀번호 화면
- 실시간 전체 주문 목록 확인
- 메뉴별 주문 개수 자동 집계
- 총 금액 자동 계산
- 주문별 삭제
- 전체 주문 삭제
- 주문 마감 / 다시 열기
- CSV 다운로드
- 모바일 최적화 디자인

## 1. Firebase 만들기

1. https://console.firebase.google.com 접속
2. 프로젝트 추가
3. Firestore Database 만들기
4. 시작 모드는 테스트 모드로 선택
5. 프로젝트 설정 → 일반 → 내 앱 → 웹앱 추가
6. Firebase SDK 설정값을 복사

## 2. Firebase 설정 파일 만들기

`firebase-config.example.js` 파일 이름을 `firebase-config.js`로 바꾼 뒤 아래 부분에 Firebase 설정값을 붙여 넣으세요.

```js
window.firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 3. 관리자 비밀번호 바꾸기

`app.js` 파일 맨 위쪽의 아래 부분을 원하는 비밀번호로 바꾸세요.

```js
const ADMIN_PASSWORD = "1234";
```

예:

```js
const ADMIN_PASSWORD = "hwangji2026";
```

## 4. 메뉴와 가격 수정하기

`app.js`의 `MENU_DATA` 부분에서 메뉴와 가격을 수정할 수 있습니다.

```js
{ name:"아메리카노", price:2000, temps:["ICE","HOT"] }
```

HOT이 안 되는 메뉴는 다음처럼 두면 됩니다.

```js
{ name:"레몬에이드", price:3500, temps:["ICE"] }
```

## 5. 배포 방법: Netlify 추천

1. https://www.netlify.com 접속
2. 로그인
3. Add new site → Deploy manually
4. 이 폴더 안의 파일 전체를 드래그해서 업로드
5. 생성된 주소를 교직원 단톡방에 공유

예:

`https://hwangji-megacoffee.netlify.app`

## 6. QR코드 만들기

배포된 주소를 복사한 뒤 네이버나 구글에서 “QR코드 만들기”를 검색해 QR코드로 만들면 됩니다.

## 주의

- Firebase 테스트 모드는 일정 기간 뒤 만료될 수 있습니다.
- 실제로 오래 사용하려면 Firestore 보안 규칙을 정리하는 것이 좋습니다.
- 관리자 비밀번호는 프론트엔드 코드에 들어 있으므로 강한 보안용은 아닙니다. 학교 내부 단체 주문처럼 간단한 용도로 쓰기 적합합니다.
