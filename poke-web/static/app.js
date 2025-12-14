// 지역 목록 로드
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

// 지역별 포켓몬 로드
async function loadEncounters(lid, lname) {
  const res = await fetch(`/api/encounters?location_id=${lid}`);
  const rows = await res.json();

  document.getElementById("resultTitle").textContent =
    `${lname} 등장 포켓몬`;

  const ul = document.getElementById("result");
  ul.innerHTML = "";

  if (rows.length === 0) {
    ul.innerHTML = "<li>출현 포켓몬 없음</li>";
    return;
  }

  rows.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.Pname}</strong>
      <span class="type">
        (${r.type1}${r.type2 ? "/" + r.type2 : ""})
      </span>
      <span class="level">
        Lv ${r.min_level}~${r.max_level}
      </span>
    `;
    ul.appendChild(li);
  });
}

// 포켓몬 → 지역 검색
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
    li.classList.add("search-item");

    li.addEventListener("click", () => {
      loadEncounters(loc.Lid, loc.Lname);
      searchResult.innerHTML = "";
    });

    searchResult.appendChild(li);
  });
});

// 초기 실행
loadLocations();
