// =====================================
// 전역 상태
// =====================================
let activeType = null;

// =====================================
// 다크모드
// =====================================
const toggleBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleBtn.textContent = "☀️ 라이트모드";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  toggleBtn.textContent = isDark ? "☀️ 라이트모드" : "🌙 다크모드";
});

// =====================================
// 지역 목록
// =====================================
async function loadLocations() {
  const res = await fetch("/api/locations");
  const locations = await res.json();

  const ul = document.getElementById("locationList");
  ul.innerHTML = "";

  locations.forEach(loc => {
    const li = document.createElement("li");
    li.textContent = `${loc.Lid}. ${loc.Lname}`;
    li.classList.add("location-item");

    li.addEventListener("click", () => {
      document.querySelectorAll(".location-item")
        .forEach(el => el.classList.remove("active"));

      li.classList.add("active");
      loadEncounters(loc.Lid, loc.Lname);
    });

    ul.appendChild(li);
  });
}

// =====================================
// 지역별 포켓몬
// =====================================
async function loadEncounters(lid, lname) {
  const img = document.getElementById("locationImg");
  img.src = `/static/images/locations/${lid}.webp`;
  img.onerror = () => img.src = "";

  const res = await fetch(`/api/encounters?location_id=${lid}`);
  const rows = await res.json();

  document.getElementById("resultTitle").textContent =
    `${lname} 등장 포켓몬`;

  const ul = document.getElementById("result");
  ul.innerHTML = "";

  rows.forEach(r => {
    const li = document.createElement("li");
    li.classList.add("pokemon-row");

    li.innerHTML = `
      <img class="sprite" src="/static/images/pokemon/${r.Pid}.png">
      <strong>${r.Pname}</strong>
      <span class="type type-${r.type1}">${r.type1}</span>
      ${r.type2 ? `<span class="type type-${r.type2}">${r.type2}</span>` : ""}
      <span class="level">Lv ${r.min_level}~${r.max_level}</span>
    `;

    ul.appendChild(li);
  });
}

// =====================================
// 포켓몬 이름 자동완성 검색
// =====================================
const searchInput = document.getElementById("pokemonSearch");
const searchResult = document.getElementById("searchResult");

searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.trim();

  if (!keyword) {
    searchResult.innerHTML = "";
    return;
  }

  const res = await fetch(
    `/api/pokemon/autocomplete?q=${encodeURIComponent(keyword)}`
  );
  const pokemons = await res.json();

  searchResult.innerHTML = "";

  if (pokemons.length === 0) {
    searchResult.innerHTML = "<li>검색 결과 없음</li>";
    return;
  }

  pokemons.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img class="sprite" src="/static/images/pokemon/${p.Pid}.png">
      <strong>${p.Pname}</strong>
    `;

    li.addEventListener("click", () => {
      loadLocationsByPokemon(p.Pid, p.Pname);
      searchInput.value = p.Pname;
      searchResult.innerHTML = "";
    });

    searchResult.appendChild(li);
  });
});

// =====================================
// 타입 필터 접기 / 펼치기
// =====================================
const toggleTypeBtn = document.getElementById("toggleTypeFilter");
const typeFilter = document.getElementById("typeFilter");
let typeOpen = false;

toggleTypeBtn.addEventListener("click", () => {
  typeOpen = !typeOpen;
  typeFilter.classList.toggle("hidden", !typeOpen);
  toggleTypeBtn.textContent = typeOpen ? "닫기" : "열기";
});

// =====================================
// 타입 목록
// =====================================
async function loadTypes() {
  const res = await fetch("/api/types");
  const types = await res.json();

  const box = document.getElementById("typeButtons");
  box.innerHTML = "";

  types.forEach(type => {
    const btn = document.createElement("button");
    btn.textContent = type;
    btn.classList.add("type", `type-${type}`);

    btn.addEventListener("click", () => {
      // 같은 타입 다시 클릭 → 필터 해제
      if (activeType === type) {
        activeType = null;

        document.querySelectorAll("#typeButtons button")
          .forEach(b => b.classList.remove("active"));

        document.getElementById("typeTitle").textContent = "";
        document.getElementById("typePokemonList").innerHTML = "";
        document.getElementById("pokemonLocationTitle").textContent = "";
        document.getElementById("pokemonLocationList").innerHTML = "";
        return;
      }

      // 새로운 타입 선택
      activeType = type;

      document.querySelectorAll("#typeButtons button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      loadPokemonsByType(type);
    });

    box.appendChild(btn);
  });
}

// =====================================
// 타입 → 포켓몬
// =====================================
async function loadPokemonsByType(type) {
  const res = await fetch(`/api/type/${encodeURIComponent(type)}`);
  const pokemons = await res.json();

  document.getElementById("typeTitle").textContent =
    `타입: ${type}`;

  const ul = document.getElementById("typePokemonList");
  ul.innerHTML = "";

  pokemons.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img class="sprite" src="/static/images/pokemon/${p.Pid}.png">
      <strong>${p.Pname}</strong>
    `;

    li.addEventListener("click", () => {
      loadLocationsByPokemon(p.Pid, p.Pname);
    });

    ul.appendChild(li);
  });
}

// =====================================
// 포켓몬 → 등장 지역
// =====================================
async function loadLocationsByPokemon(pid, name) {
  const res = await fetch(`/api/pokemon/${pid}/locations`);
  const locations = await res.json();

  document.getElementById("pokemonLocationTitle").textContent =
    `${name} 등장 지역`;

  const ul = document.getElementById("pokemonLocationList");
  ul.innerHTML = "";

  if (locations.length === 0) {
    const li = document.createElement("li");
    li.textContent = "서식지 없음";
    li.style.opacity = "0.6";
    ul.appendChild(li);
    return;
  }

  locations.forEach(loc => {
    const li = document.createElement("li");
    li.textContent = `${loc.Lid}. ${loc.Lname}`;

    li.addEventListener("click", () => {
      loadEncounters(loc.Lid, loc.Lname);
    });

    ul.appendChild(li);
  });
}

// =====================================
// 초기 실행
// =====================================
loadLocations();
loadTypes();
