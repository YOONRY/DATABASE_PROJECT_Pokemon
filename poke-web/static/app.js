let currentEncounters = [];

// 다크모드
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

// 지역 목록
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

// 지역별 포켓몬
async function loadEncounters(lid, lname) {
  const img = document.getElementById("locationImg");
  img.src = `/static/images/locations/${lid}.webp`;
  img.onerror = () => img.src = "";

  const res = await fetch(`/api/encounters?location_id=${lid}`);
  const rows = await res.json();

  currentEncounters = rows;
  document.getElementById("resultTitle").textContent = `${lname} 등장 포켓몬`;
  renderEncounters(rows);
}

function renderEncounters(rows) {
  const ul = document.getElementById("result");
  ul.innerHTML = "";

  rows.forEach(r => {
    const li = document.createElement("li");
    li.classList.add("pokemon-row");

    li.innerHTML = `
      <img
        class="sprite"
        src="/static/images/pokemon/${r.Pid}.png"
        alt="${r.Pname}"
        loading="lazy"
      >
      <strong>${r.Pname}</strong>

      <span class="type type-${r.type1}">${r.type1}</span>
      ${r.type2 ? `<span class="type type-${r.type2}">${r.type2}</span>` : ""}

      <span class="level">Lv ${r.min_level}~${r.max_level}</span>
    `;

    ul.appendChild(li);
  });
}

// ================================
// 포켓몬 이름으로 지역 검색
// ================================
const searchInput = document.getElementById("pokemonSearch");
const searchResult = document.getElementById("searchResult");

searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.trim();

  if (!keyword) {
    searchResult.innerHTML = "";
    return;
  }

  const res = await fetch(`/api/search/pokemon?q=${encodeURIComponent(keyword)}`);
  const locations = await res.json();

  searchResult.innerHTML = "";

  if (locations.length === 0) {
    searchResult.innerHTML = "<li>등장 지역 없음</li>";
    return;
  }

  locations.forEach(loc => {
    const li = document.createElement("li");
    li.textContent = `${loc.Lid}. ${loc.Lname}`;

    li.addEventListener("click", () => {
      // 지역 선택 시 해당 지역 로딩
      loadEncounters(loc.Lid, loc.Lname);

      // 검색 결과 닫기
      searchResult.innerHTML = "";
      searchInput.value = "";
    });

    searchResult.appendChild(li);
  });
});

// 초기 실행
loadLocations();
