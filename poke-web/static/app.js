// =====================================
// 전역 상태
// =====================================
let activeType = null;
let activeLocationId = null;

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
      // 같은 지역 다시 클릭 → 취소
      if (activeLocationId === loc.Lid) {
        activeLocationId = null;
        li.classList.remove("active");

        document.getElementById("resultTitle").textContent =
          "지역을 선택하세요";
        document.getElementById("result").innerHTML = "";
        document.getElementById("locationImg").src = "";
        return;
      }

      activeLocationId = loc.Lid;
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
      <div class="info">
        <div class="name">
          <strong>${r.Pname}</strong>
          <span class="level">Lv ${r.min_level}~${r.max_level}</span>
        </div>
        <div class="types">
          <span class="type type-${r.type1}">${r.type1}</span>
          ${r.type2 ? `<span class="type type-${r.type2}">${r.type2}</span>` : ""}
        </div>
      </div>
    `;

    // 포켓몬 클릭 → 진화 트리
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      loadEvolution(r.Pid, r.Pname);
    });

    ul.appendChild(li);
  });
}

// =====================================
// 포켓몬 자동완성 검색
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
    ul.innerHTML = "<li style='opacity:0.6'>서식지 없음</li>";
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
// 진화 트리 (모달)
// =====================================
async function loadEvolution(pid, name) {
  const modal = document.getElementById("evoModal");
  const ul = document.getElementById("evoList");

  const res = await fetch(`/api/pokemon/${pid}/evolution`);
  const evos = await res.json();

  document.getElementById("evoTitle").textContent =
    `${name} 진화 트리`;

  ul.innerHTML = "";

  if (evos.length === 0) {
    ul.innerHTML = "<li>진화 없음</li>";
    modal.classList.remove("hidden");
    return;
  }

  evos.forEach(e => {
    const li = document.createElement("li");
    li.classList.add("evo-row");

    li.innerHTML = `
      <div class="evo-pokemon">
        <img src="/static/images/pokemon/${e.from_pid}.png">
        <div>${e.from_name}</div>
      </div>

      <div class="evo-arrow">
        →
        <div class="evo-condition">${e.condition || ""}</div>
      </div>

      <div class="evo-pokemon">
        <img src="/static/images/pokemon/${e.to_pid}.png">
        <div>${e.to_name}</div>
      </div>
    `;

    ul.appendChild(li);
  });

  modal.classList.remove("hidden");
}

// 닫기 버튼
document.getElementById("closeEvoModal")?.addEventListener("click", () => {
  document.getElementById("evoModal").classList.add("hidden");
});

// 모달 바깥 클릭 → 닫기
document.getElementById("evoModal")?.addEventListener("click", (e) => {
  if (e.target.id === "evoModal") {
    e.currentTarget.classList.add("hidden");
  }
});

// ESC 키로 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("evoModal")?.classList.add("hidden");
  }
});

// =====================================
// 초기 실행
// =====================================
loadLocations();
