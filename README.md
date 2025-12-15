
# 🧩 Pokémon Encounter Database Web

**포켓몬 레드·그린·블루·피카츄 버전**을 기반으로
👉 **지역별 등장 포켓몬 / 포켓몬별 서식지 / 타입 필터 / 진화 트리**를
웹에서 한눈에 확인할 수 있는 데이터베이스 웹 서비스입니다.

---

## 📌 프로젝트 개요

* **주제**
  포켓몬 1세대(레드·그린)의 등장 정보를 데이터베이스로 정리하고
  이를 웹 인터페이스로 시각화

* **목표**

  * 관계형 데이터베이스 설계 연습
  * SQL + Flask 기반 백엔드 API 구현
  * 순수 JavaScript로 동적 UI 구성

---

## 🛠 사용 기술 스택

### Backend

* **Python 3**
* **Flask**
* **SQLite3**

### Frontend

* **HTML5**
* **CSS3**
* **Vanilla JavaScript (Fetch API)**

### Database

* **SQLite**
* 게임 데이터를 기반으로 직접 설계한 테이블 구조

  * pokemon
  * location
  * encounter
  * evolution

---

## 🗄 데이터베이스 구조 (요약)

### pokemon

| 컬럼    | 설명             |
| ----- | -------------- |
| Pid   | 포켓몬 ID         |
| Pname | 포켓몬 이름         |
| type1 | 주 타입           |
| type2 | 부 타입 (NULL 가능) |

### location

| 컬럼    | 설명    |
| ----- | ----- |
| Lid   | 지역 ID |
| Lname | 지역 이름 |

### encounter

| 컬럼          | 설명      |
| ----------- | ------- |
| Eid         | 인카운터 ID |
| pokemon_id  | 포켓몬 ID  |
| location_id | 지역 ID   |
| min_level   | 최소 레벨   |
| max_level   | 최대 레벨   |

### evolution

| 컬럼              | 설명    |
| --------------- | ----- |
| Vid             | 진화 ID |
| from_pokemon_id | 진화 전  |
| to_pokemon_id   | 진화 후  |
| condition       | 진화 조건 |

---

## ✨ 주요 기능

### 📍 지역별 등장 포켓몬

* 지역 선택 시 해당 지역에서 등장하는 포켓몬 목록 표시
* 등장 레벨 범위 확인 가능
* 지역 이미지 표시

### 🔍 포켓몬 이름 검색 (자동완성)

* 일부 이름 입력만으로 자동완성 목록 제공
* 포켓몬 선택 시 등장 지역 목록 표시
* 서식지 없는 포켓몬은 **“서식지 없음”** 표시(주로 교환이나 이벤트 전용 포켓몬)

### 🧪 타입 필터

* 타입 버튼을 눌러 해당 타입 포켓몬 목록 표시
* 다시 클릭 시 필터 해제
* 현재 선택된 타입 시각적 강조

### 🌗 다크 모드

* 버튼 클릭으로 다크 / 라이트 모드 전환
* 설정은 LocalStorage에 저장

### 🔁 진화 트리 (모달)

* 포켓몬 클릭 시 **진화 트리 모달 표시**
* 진화 방향 화살표 + 진화 조건 표시
* 진화 트리 내에서 다시 클릭 가능

---

## 🖼 스크린샷 (선택)

<img width="2556" height="1302" alt="image" src="https://github.com/user-attachments/assets/7ebbad52-00e1-446a-8171-7d65f96a3f99" />

<img width="2559" height="347" alt="image" src="https://github.com/user-attachments/assets/918aad2f-e710-4782-ac40-d5e7eb9769fc" />

<img width="534" height="300" alt="image" src="https://github.com/user-attachments/assets/18009403-2902-4334-a9db-e3d22563d8e7" />


---


## 📁 프로젝트 구조

```
poke-web/
│
├─ app.py https://github.com/YOONRY/DATABASE_PROJECT_Pokemon/blob/main/poke-web/app.py
├─ pokemon.db
│
├─ templates/
│   └─ index.html https://github.com/YOONRY/DATABASE_PROJECT_Pokemon/blob/main/poke-web/templates/index.html
│
├─ static/
│   ├─ style.css https://github.com/YOONRY/DATABASE_PROJECT_Pokemon/blob/main/poke-web/static/style.css
│   ├─ app.js https://github.com/YOONRY/DATABASE_PROJECT_Pokemon/blob/main/poke-web/static/app.js
│   └─ images/
│       ├─ locations/
│       └─ pokemon/
│
└─ README.md
```

---

## 🧠 설계 포인트

* 중복 인카운터 제거
* 모든 UI 동작은 **페이지 새로고침 없이 AJAX 처리**
* 확장 가능하도록 API 구조 분리



---

## 🙌 마무리

이 프로젝트는
**DB 설계 → 데이터 구축 → API → 프론트엔드 연동**까지
전체 흐름을 직접 경험하기 위해 제작되었습니다.

포켓몬이라는 친숙한 소재를 통해
**데이터베이스와 웹 개발의 연결**을 실습한 프로젝트입니다.

---
