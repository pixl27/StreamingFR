/* ============================================================
   CINÉMATHÈQUE — Interactions
   Hero/générique · rails · fiche · projection (démo) ·
   recherche · ma liste. HTML/CSS/JS pur, aucune dépendance.
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const parId = id => CATALOGUE.find(c => c.id === id);

  /* ----- icônes ----- */
  const ICO = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.4v.01"/></svg>'
  };

  /* ----- utilitaires ----- */
  const sansAccent = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const sep = '<span class="sep" aria-hidden="true"></span>';

  function fond(c) {
    const [a, b] = c.grad;
    return `radial-gradient(130% 130% at 22% 12%, ${a} 0%, transparent 52%),`
         + `radial-gradient(130% 130% at 82% 88%, ${b} 0%, transparent 52%),`
         + `linear-gradient(145deg, ${a} 0%, #0b0c12 54%, ${b} 132%)`;
  }
  function ficheLigne(c) {
    const parts = [c.langue, c.annee, c.duree, c.genres.join(" / ")];
    return parts.map(p => `<span>${p}</span>`).join(sep)
      + sep + `<span class="hero__note">★ ${c.note.toFixed(1)}</span>`;
  }

  /* ----- RecentSearches History ----- */
  const RecentSearches = {
    get() {
      try {
        const arr = JSON.parse(localStorage.getItem("cinematheque:recentSearches")) || [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    },
    save(itemData) {
      if (!itemData || !itemData.id) return;
      let list = this.get().filter(s => s.id !== itemData.id);
      list.unshift({
        id: itemData.id,
        title: itemData.title || '',
        poster: itemData.poster || '',
        isLocal: !!itemData.isLocal
      });
      list = list.slice(0, 10);
      try {
        localStorage.setItem("cinematheque:recentSearches", JSON.stringify(list));
      } catch (e) {}
    },
    clear() {
      try {
        localStorage.removeItem("cinematheque:recentSearches");
      } catch (e) {}
    }
  };

  /* ----- MatchCache & Auto-Match French Stream ----- */
  const MatchCache = {
    data: {},
    init() {
      try {
        this.data = JSON.parse(localStorage.getItem("cinematheque:matches")) || {};
      } catch (e) {
        this.data = {};
      }
    },
    get(id) {
      return this.data[id] || null;
    },
    set(id, matchData) {
      this.data[id] = matchData;
      try {
        localStorage.setItem("cinematheque:matches", JSON.stringify(this.data));
      } catch (e) {}
    }
  };

  const cleanString = str => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractYear = title => {
    const m = title.match(/\b(19\d\d|20\d\d)\b/);
    return m ? parseInt(m[1], 10) : null;
  };

  function scoreMatch(movie, item) {
    const cleanMovieTitle = cleanString(movie.titre);
    const cleanMovieCourt = cleanString(movie.court);
    const cleanItemTitle = cleanString(item.title);
    
    const itemYear = extractYear(item.title);
    const itemTitleNoYear = item.title.replace(/\b(19\d\d|20\d\d)\b/g, "");
    const cleanItemTitleNoYear = cleanString(itemTitleNoYear);

    let score = 0;

    if (cleanItemTitleNoYear === cleanMovieTitle || cleanItemTitleNoYear === cleanMovieCourt) {
      score += 50;
    } else if (cleanItemTitleNoYear.includes(cleanMovieTitle) || cleanItemTitleNoYear.includes(cleanMovieCourt)) {
      score += 30;
    } else if (cleanMovieTitle.includes(cleanItemTitleNoYear) || cleanMovieCourt.includes(cleanItemTitleNoYear)) {
      score += 20;
    }

    const movieWords = cleanMovieTitle.split(" ");
    const itemWords = cleanItemTitleNoYear.split(" ");
    let matchCount = 0;
    movieWords.forEach(w => {
      if (w.length > 2 && itemWords.includes(w)) {
        matchCount++;
      }
    });
    score += matchCount * 5;

    if (itemYear && movie.annee) {
      if (itemYear === movie.annee) {
        score += 30;
      } else if (Math.abs(itemYear - movie.annee) <= 1) {
        score += 10;
      } else {
        score -= 20;
      }
    }

    const isItemSerie = item.href.includes("-saison-") || cleanItemTitle.includes("saison");
    const isMovieSerie = movie.type === "serie";
    if (isItemSerie === isMovieSerie) {
      score += 15;
    } else {
      score -= 15;
    }

    return score;
  }

  async function searchFrenchStream(query) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (e) {
      return [];
    }
  }

  async function loadPostersInBackground() {
    const uncached = CATALOGUE.filter(c => !MatchCache.get(c.id));
    for (const movie of uncached) {
      try {
        let searchItems = await searchFrenchStream(movie.titre);
        if (!searchItems || searchItems.length === 0) {
          if (movie.court !== movie.titre) {
            searchItems = await searchFrenchStream(movie.court);
          }
        }
        
        if (searchItems && searchItems.length > 0) {
          let bestItem = null;
          let bestScore = -999;
          
          for (const item of searchItems) {
            const score = scoreMatch(movie, item);
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestItem = item;
            }
          }
          
          if (bestItem) {
            const matchData = {
              newsId: bestItem.id,
              poster: bestItem.poster,
              backdrop: null
            };
            MatchCache.set(movie.id, matchData);
            applyPosterToCards(movie.id, bestItem.poster);
          }
        }
      } catch (e) {
        console.error(`Failed background search for ${movie.titre}:`, e);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  async function retrieveBackdropInBackground(movieId) {
    const match = MatchCache.get(movieId);
    if (!match || !match.newsId) return null;
    if (match.backdrop) return match.backdrop;
    
    try {
      const response = await fetch(`/api/players?id=${match.newsId}`);
      const data = await response.json();
      const backdropUrl = data && data.meta && data.meta.affiche2;
      if (backdropUrl) {
        match.backdrop = backdropUrl;
        MatchCache.set(movieId, match);
        return backdropUrl;
      }
    } catch (e) {
      console.error(`Failed backdrop retrieval for ${movieId}:`, e);
    }
    return null;
  }

  function applyPosterToCards(movieId, posterUrl) {
    if (!posterUrl) return;
    const cardImgs = $$(`.card__img[data-poster-id="${movieId}"]`);
    cardImgs.forEach(div => {
      const img = new Image();
      img.src = posterUrl;
      img.onload = () => {
        div.style.backgroundImage = `url("${posterUrl}")`;
        div.classList.add("has-image");
      };
    });
  }

  function applyCachedPosters() {
    $$(".card__img[data-poster-id]").forEach(div => {
      const movieId = div.dataset.posterId;
      const match = MatchCache.get(movieId);
      if (match && match.poster) {
        div.style.backgroundImage = `url("${match.poster}")`;
        div.classList.add("has-image");
      }
    });
  }

  function applyCachedSearchPosters() {
    $$(".reche__vig[data-poster-id]").forEach(div => {
      const movieId = div.dataset.posterId;
      const match = MatchCache.get(movieId);
      if (match && match.poster) {
        let img = div.querySelector(".reche__vig-img");
        if (!img) {
          img = document.createElement("div");
          img.className = "reche__vig-img";
          div.appendChild(img);
        }
        img.style.backgroundImage = `url("${match.poster}")`;
        img.classList.add("has-image");
      }
    });
  }

  /* ----- ma liste (persistée si possible) ----- */
  const Liste = {
    set: new Set(),
    init() {
      try { (JSON.parse(localStorage.getItem("cinematheque:liste")) || []).forEach(id => this.set.add(id)); }
      catch (e) { /* file:// sans stockage : on garde en mémoire */ }
      this.maj();
    },
    a(id) { return this.set.has(id); },
    bascule(id) {
      const c = parId(id); if (!c) return;
      let ajout;
      if (this.set.has(id)) { this.set.delete(id); ajout = false; }
      else { this.set.add(id); ajout = true; }
      try { localStorage.setItem("cinematheque:liste", JSON.stringify([...this.set])); } catch (e) {}
      this.maj();
      toast(ajout ? `<b>${c.court}</b> ajouté à votre liste` : `<b>${c.court}</b> retiré de votre liste`);
      syncBoutonsListe(id);
    },
    maj() { $("#compteur-liste").textContent = this.set.size; }
  };

  /* ================= HERO / GÉNÉRIQUE ================= */
  const vedettes = VEDETTES.map(parId).filter(Boolean);
  let vIndex = 0, vTimer = null;

  function montreVedette(i) {
    vIndex = (i + vedettes.length) % vedettes.length;
    const c = vedettes[vIndex];
    const stage = $("#hero-stage");
    stage.innerHTML = `
      <div class="hero__bg">
        <div class="hero__bg-img"></div>
      </div>
      <div class="hero__glyph" aria-hidden="true">${c.court[0]}</div>
      <div class="hero__content">
        <span class="hero__eyebrow">À l'affiche · ce soir</span>
        <h1 class="hero__titre">${c.titre}</h1>
        <div class="hero__fiche">${ficheLigne(c)}</div>
        <p class="hero__synopsis">${c.synopsis}</p>
        <div class="hero__actions">
          <button class="btn btn--play" data-play="${c.id}">${ICO.play} Lecture</button>
          <button class="btn btn--ghost" data-fiche="${c.id}">${ICO.info} Détails</button>
          <button class="btn btn--ghost" data-liste="${c.id}">${Liste.a(c.id) ? ICO.check : ICO.plus} Ma liste</button>
        </div>
      </div>`;
    $(".hero__bg", stage).style.background = fond(c);
    
    // Backdrop loading for Hero
    retrieveBackdropInBackground(c.id).then(backdropUrl => {
      if (backdropUrl) {
        const bgImg = stage.querySelector(".hero__bg-img");
        if (bgImg) {
          const img = new Image();
          img.src = backdropUrl;
          img.onload = () => {
            bgImg.style.backgroundImage = `url("${backdropUrl}")`;
            bgImg.classList.add("has-image");
          };
        }
      }
    });

    $$("#hero-rail .hero__dot").forEach((d, k) => d.classList.toggle("is-active", k === vIndex));
  }

  function construitDots() {
    const rail = $("#hero-rail");
    rail.innerHTML = vedettes.map((c, k) =>
      `<button class="hero__dot" role="tab" aria-label="Voir ${c.court}" data-dot="${k}"></button>`).join("");
    rail.addEventListener("click", e => {
      const b = e.target.closest("[data-dot]"); if (!b) return;
      relanceCarousel(+b.dataset.dot);
    });
  }
  function relanceCarousel(i) {
    montreVedette(i);
    clearInterval(vTimer);
    vTimer = setInterval(() => montreVedette(vIndex + 1), 7000);
  }

  /* ================= RAILS ================= */
  function carte(c) {
    const enListe = Liste.a(c.id);
    return `
      <article class="card" tabindex="0" role="button" data-fiche="${c.id}" aria-label="${c.titre}">
        <div class="card__poster" style="background:${fond(c)}">
          <div class="card__img" data-poster-id="${c.id}"></div>
          <div class="card__lettre" aria-hidden="true">${c.court[0]}</div>
          <div class="card__haut">
            <span class="tag">${c.langue}</span>
            <span class="tag tag--note">★ ${c.note.toFixed(1)}</span>
          </div>
          <div class="card__pied">
            <h3 class="card__titre">${c.titre}</h3>
            <div class="card__meta">${c.annee} · ${c.genres[0]}${c.type === "serie" ? " · Série" : ""}</div>
          </div>
          <div class="card__survol">
            <h3 class="card__titre">${c.titre}</h3>
            <p class="card__resume">${c.synopsis}</p>
            <span class="card__cta">${ICO.play} Voir la fiche</span>
          </div>
        </div>
      </article>`;
  }

  function railHTML(r, idx) {
    const items = CATALOGUE.filter(r.filtre);
    if (!items.length) return "";
    return `
      <section class="rail" data-rail="${idx}" aria-label="${r.titre}">
        <div class="rail__tete">
          <h2 class="rail__titre">${r.titre}</h2>
          <span class="rail__sous">${r.sous}</span>
          <button class="rail__voir" data-voir="${idx}">Tout voir →</button>
        </div>
        <div class="rail__piste">${items.map(carte).join("")}</div>
      </section>`;
  }

  function renderRails() {
    $("#rails").innerHTML = RAILS.map(railHTML).join("");
    observeRails();
    applyCachedPosters();
  }

  /* Vue « collection » (filtres de la nav / tout voir) */
  function renderCollection(titre, sous, predicate) {
    const items = CATALOGUE.filter(predicate);
    $("#rails").innerHTML = `
      <section class="rail is-seen" aria-label="${titre}" style="opacity:1">
        <div class="rail__tete">
          <h2 class="rail__titre">${titre}</h2>
          <span class="rail__sous">${items.length} titre${items.length > 1 ? "s" : ""} · ${sous}</span>
        </div>
        <div class="rail__piste" style="flex-wrap:wrap">
          ${items.map(carte).join("")}
        </div>
      </section>`;
    applyCachedPosters();
    window.scrollTo({ top: $(".rails").offsetTop - 70, behavior: "smooth" });
  }

  /* ================= FICHE (modale) ================= */
  let dernierFocus = null;

  function ouvreFiche(id) {
    const c = parId(id); if (!c) return;
    $("#fiche-carte").innerHTML = `
      <button class="fiche__fermer" data-fermer aria-label="Fermer">✕</button>
      <div class="fiche__entete">
        <div class="fiche__entete-img"></div>
        <div class="fiche__entete-glyph" aria-hidden="true">${c.court[0]}</div>
        <div class="fiche__titrebloc">
          <p class="fiche__sur">${c.type === "serie" ? "Série" : "Film"} · ${c.pays}</p>
          <h2 class="fiche__titre" id="fiche-titre">${c.titre}</h2>
        </div>
      </div>
      <div class="fiche__corps">
        <div class="fiche__fiche">
          <span>${c.langue}</span>${sep}<span>${c.annee}</span>${sep}<span>${c.duree}</span>${sep}
          <span class="hero__note">★ ${c.note.toFixed(1)} / 5</span>
        </div>
        <div class="fiche__chips">${c.genres.map(g => `<span class="chip">${g}</span>`).join("")}</div>
        <p class="fiche__synopsis">${c.synopsis}</p>
        <div class="fiche__grille">
          <div class="fiche__bloc"><h4>Réalisation</h4><p>${c.realisateur}</p></div>
          <div class="fiche__bloc"><h4>Distribution</h4><p>${c.casting.join(", ")}</p></div>
          <div class="fiche__bloc"><h4>Format</h4><p>${c.langue} · 4K HDR · 5.1</p></div>
        </div>
        <div class="fiche__actions">
          <button class="btn btn--play" data-play="${c.id}">${ICO.play} Lancer la projection</button>
          <button class="btn btn--ghost" data-liste="${c.id}">${Liste.a(c.id) ? ICO.check + " Dans ma liste" : ICO.plus + " Ma liste"}</button>
        </div>
      </div>`;
    $(".fiche__entete", $("#fiche-carte")).style.background = fond(c);
    
    // Backdrop loading for Modal Fiche
    retrieveBackdropInBackground(c.id).then(backdropUrl => {
      if (backdropUrl) {
        const bgImg = $("#fiche-carte").querySelector(".fiche__entete-img");
        if (bgImg) {
          const img = new Image();
          img.src = backdropUrl;
          img.onload = () => {
            bgImg.style.backgroundImage = `url("${backdropUrl}")`;
            bgImg.classList.add("has-image");
          };
        }
      }
    });

    ouvre($("#fiche"));
  }

  /* ================= SALLE (lecteur de streams réel) ================= */
  let currentMovieId = null;
  let currentNewsId = null;
  let searchResultItems = [];
  let playerData = null;
  let activePlayerName = "";
  let activeVersionName = "";
  let adblockEnabled = true;
  let isSeries = false;
  let activeEpisodeNum = "";

  function getActivePlayers() {
    if (isSeries && playerData && playerData.episodes) {
      return (playerData.episodes[activeVersionName] && playerData.episodes[activeVersionName][activeEpisodeNum]) || {};
    }
    return (playerData && playerData.players) || {};
  }

  function showSalleLoading(msg) {
    const mainContent = $("#salle-main-content");
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="salle__loading-container">
          <div class="salle__spinner"></div>
          <p class="salle__loading-text">${msg}</p>
        </div>
      `;
    }
    const controls = $("#salle-player-controls");
    if (controls) controls.style.display = "none";
  }

  function renderSearchResults() {
    const mainContent = $("#salle-main-content");
    if (!mainContent) return;

    const movie = parId(currentMovieId);
    const titleVal = movie ? movie.titre : "";

    let resultsHtml = "";
    if (searchResultItems.length === 0) {
      resultsHtml = `<p class="salle__no-results">Aucun flux trouvé pour ce titre. Essayez une recherche manuelle ci-dessus.</p>`;
    } else {
      resultsHtml = `
        <div class="salle__results-grid">
          ${searchResultItems.map(item => `
            <div class="salle__result-card" data-stream-id="${item.id}">
              <div class="salle__result-poster">
                <img src="${item.poster || 'https://placehold.co/150x225/111/fff?text=Poster'}" alt="${item.title}" onerror="this.src='https://placehold.co/150x225/111/fff?text=Poster'">
              </div>
              <div class="salle__result-info">
                <h3 class="salle__result-title">${item.title}</h3>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    mainContent.innerHTML = `
      <div class="salle__search-area">
        <div class="salle__search-bar">
          <input type="text" id="input-search-manual" placeholder="Chercher un film ou une série..." value="${titleVal}">
          <button id="btn-search-manual">Rechercher</button>
        </div>
        <h2 class="salle__section-title">Résultats sur French Stream</h2>
        ${resultsHtml}
      </div>
    `;

    // Hide back button, hide player controls
    const backBtn = $("#btn-retour-recherche");
    if (backBtn) backBtn.style.display = "none";
    const controls = $("#salle-player-controls");
    if (controls) controls.style.display = "none";
  }

  async function performManualSearch(query) {
    showSalleLoading(`Recherche de "${query}" sur French Stream...`);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const items = await response.json();
      searchResultItems = items;
      renderSearchResults();
    } catch (e) {
      const mainContent = $("#salle-main-content");
      if (mainContent) {
        mainContent.innerHTML = `<p class="salle__error">Erreur de connexion avec le proxy : ${e.message}</p>`;
      }
    }
  }

  function getAvailableVersions(playerObj) {
    if (!playerObj) return [];
    const versions = [];
    if (playerObj.default) versions.push({ key: 'default', label: 'VF' });
    if (playerObj.vff) versions.push({ key: 'vff', label: 'TrueFrench (VFF)' });
    if (playerObj.vfq) versions.push({ key: 'vfq', label: 'VFQ' });
    if (playerObj.vostfr) versions.push({ key: 'vostfr', label: 'VOSTFR' });
    return versions;
  }

  function renderEpisodesSelector() {
    const epContainer = $("#salle-episodes-container");
    if (!epContainer) return;

    if (!isSeries || !playerData || !playerData.episodes) {
      epContainer.style.display = "none";
      return;
    }

    const currentEps = playerData.episodes[activeVersionName] || {};
    const epNumbers = Object.keys(currentEps).map(Number).sort((a,b)=>a-b);

    if (epNumbers.length === 0) {
      epContainer.style.display = "none";
      return;
    }

    const info = playerData.episodes.info || {};

    let gridHtml = epNumbers.map(num => {
      const isSelected = String(num) === activeEpisodeNum;
      const epInfo = info[num] || {};
      return `
        <button class="salle__episode-card ${isSelected ? 'is-active' : ''}" data-sel-episode="${num}">
          <span class="salle__episode-num">Épisode ${num}</span>
          ${epInfo.title ? `<span class="salle__episode-title" title="${epInfo.title}">${epInfo.title}</span>` : ''}
        </button>
      `;
    }).join("");

    epContainer.innerHTML = `
      <div class="salle__episodes-selector">
        <h3 class="salle__section-title">Sélectionner un épisode</h3>
        <div class="salle__episodes-grid">
          ${gridHtml}
        </div>
      </div>
    `;
    epContainer.style.display = "block";
  }

  function renderPlayerControls() {
    const versionsContainer = $("#salle-versions");
    const playersContainer = $("#salle-players");
    if (!versionsContainer || !playersContainer) return;

    if (isSeries) {
      // 1. Render Series Version Tabs (VF, VOSTFR, VO)
      const versionsList = ['vf', 'vostfr', 'vo'].filter(v => playerData.episodes[v] && Object.keys(playerData.episodes[v]).length > 0);
      versionsContainer.innerHTML = versionsList.map(v => {
        const isSelected = v === activeVersionName;
        const label = v.toUpperCase() === 'VF' ? 'VF' : (v.toUpperCase() === 'VOSTFR' ? 'VOSTFR' : 'VO');
        return `<button class="salle__tab-btn ${isSelected ? 'is-active' : ''}" data-sel-series-version="${v}">${label}</button>`;
      }).join("");

      // 2. Render Players for Active Version & Episode
      const plist = getActivePlayers();
      const playersList = [];
      for (const name in plist) {
        if (plist[name]) {
          playersList.push(name);
        }
      }
      playersContainer.innerHTML = playersList.map(name => {
        const isSelected = name.toLowerCase() === activePlayerName.toLowerCase();
        const dispName = name.toUpperCase() === 'PREMIUM' ? 'PRO (Sans Pubs)' : name;
        return `<button class="salle__tab-btn ${isSelected ? 'is-active' : ''}" data-sel-player="${name}">${dispName}</button>`;
      }).join("");

      // 3. Render Episode Selector Grid
      renderEpisodesSelector();
    } else {
      const epContainer = $("#salle-episodes-container");
      if (epContainer) epContainer.style.display = "none";

      // 1. Render Players
      const playersList = [];
      const plist = playerData.players || {};
      for (const name in plist) {
        const pobj = plist[name];
        if (pobj && (pobj.default || pobj.vff || pobj.vfq || pobj.vostfr)) {
          playersList.push(name);
        }
      }

      playersContainer.innerHTML = playersList.map(name => {
        const isSelected = name.toLowerCase() === activePlayerName.toLowerCase();
        const dispName = name.toUpperCase() === 'PREMIUM' ? 'PRO (Sans Pubs)' : name;
        return `<button class="salle__tab-btn ${isSelected ? 'is-active' : ''}" data-sel-player="${name}">${dispName}</button>`;
      }).join("");

      // 2. Render Versions for Active Player
      const activePlayerObj = plist[activePlayerName.toLowerCase()];
      const versions = getAvailableVersions(activePlayerObj);

      versionsContainer.innerHTML = versions.map(v => {
        const isSelected = v.key === activeVersionName;
        return `<button class="salle__tab-btn ${isSelected ? 'is-active' : ''}" data-sel-version="${v.key}">${v.label}</button>`;
      }).join("");
    }

    const controls = $("#salle-player-controls");
    if (controls) controls.style.display = "flex";
    const backBtn = $("#btn-retour-recherche");
    if (backBtn) backBtn.style.display = "block";
  }

  function loadIframePlayer() {
    const mainContent = $("#salle-main-content");
    if (!mainContent) return;

    let url = "";
    if (isSeries) {
      const eps = playerData.episodes || {};
      const activeEpObj = (eps[activeVersionName] && eps[activeVersionName][activeEpisodeNum]) || {};
      url = activeEpObj[activePlayerName.toLowerCase()] || "";
    } else {
      const plist = playerData.players || {};
      const activePlayerObj = plist[activePlayerName.toLowerCase()];
      url = activePlayerObj ? activePlayerObj[activeVersionName] : "";

      // Fallback if specific version is missing
      if (!url && activePlayerObj) {
        const keys = ['default', 'vff', 'vostfr', 'vfq'];
        for (const k of keys) {
          if (activePlayerObj[k]) {
            url = activePlayerObj[k];
            activeVersionName = k;
            break;
          }
        }
      }
    }

    if (!url) {
      mainContent.innerHTML = `<p class="salle__error">Ce flux n'est plus disponible. Veuillez choisir un autre lecteur ou langue.</p>`;
      return;
    }

    // Transform player embed URLs if needed
    if (activePlayerName.toLowerCase() === 'netu') {
      if (!url.includes('embed_player.php')) {
        url = "https://1.multiup.us/player/embed_player.php?vid=" + url + "&autoplay=yes";
      }
    }

    // Embed in an iframe
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.className = "salle__iframe";
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.frameBorder = "0";

    if (adblockEnabled) {
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
    }

    mainContent.innerHTML = "";
    mainContent.appendChild(iframe);
  }

  async function selectStreamItem(newsId) {
    currentNewsId = newsId;
    
    // Save manual match if clicked from search results
    if (currentMovieId) {
      const existing = MatchCache.get(currentMovieId);
      if (!existing || existing.newsId !== newsId) {
        const matchedItem = searchResultItems.find(item => item.id === newsId);
        const posterUrl = matchedItem ? matchedItem.poster : (existing ? existing.poster : null);
        const backdropUrl = existing ? existing.backdrop : null;
        
        MatchCache.set(currentMovieId, {
          newsId: newsId,
          poster: posterUrl,
          backdrop: backdropUrl
        });
        
        if (posterUrl) {
          applyPosterToCards(currentMovieId, posterUrl);
        }
      }
    }

    showSalleLoading("Récupération des lecteurs de streaming...");
    try {
      const response = await fetch(`/api/players?id=${newsId}`);
      const data = await response.json();
      playerData = data;

      // Cache backdrop dynamically if it is returned by players API and we don't have it yet
      const backdropUrl = playerData.meta && playerData.meta.affiche2;
      if (backdropUrl && currentMovieId) {
        const match = MatchCache.get(currentMovieId);
        if (match && !match.backdrop) {
          match.backdrop = backdropUrl;
          MatchCache.set(currentMovieId, match);
        }
      }

      isSeries = !!playerData.is_series;

      if (isSeries && playerData.episodes) {
        const versions = ['vf', 'vostfr', 'vo'].filter(v => playerData.episodes[v] && Object.keys(playerData.episodes[v]).length > 0);
        activeVersionName = versions.includes(activeVersionName) ? activeVersionName : (versions[0] || 'vf');
        
        const eps = Object.keys(playerData.episodes[activeVersionName] || {}).map(Number).sort((a,b)=>a-b);
        activeEpisodeNum = String(eps.includes(Number(activeEpisodeNum)) ? activeEpisodeNum : (eps[0] || "1"));
      } else {
        activeEpisodeNum = "";
      }

      const plist = getActivePlayers();
      const preferred = ["vidzy", "uqload", "voe", "filmoon", "netu", "premium"];
      activePlayerName = "";
      for (const p of preferred) {
        if (plist[p]) {
          activePlayerName = p;
          break;
        }
      }
      if (!activePlayerName) {
        activePlayerName = Object.keys(plist)[0] || "";
      }

      if (!activePlayerName) {
        const mainContent = $("#salle-main-content");
        if (mainContent) mainContent.innerHTML = `<p class="salle__error">Aucun lecteur disponible pour ce flux.</p>`;
        return;
      }

      if (!isSeries) {
        const activePlayerObj = plist[activePlayerName.toLowerCase()];
        const versions = getAvailableVersions(activePlayerObj);
        activeVersionName = versions[0] ? versions[0].key : 'default';
      }

      // Update UI title
      $("#playing-title").textContent = (playerData.meta && playerData.meta.title) || "Streaming";

      renderPlayerControls();
      loadIframePlayer();
    } catch (e) {
      const mainContent = $("#salle-main-content");
      if (mainContent) {
        mainContent.innerHTML = `<p class="salle__error">Erreur lors de la récupération des lecteurs : ${e.message}</p>`;
      }
    }
  }

  async function ouvreSalle(id) {
    currentMovieId = id;
    const c = parId(id); if (!c) return;

    // Inject base room layout
    $("#salle-inner").innerHTML = `
      <div class="salle__header">
        <button class="salle__fermer-btn" id="btn-retour-recherche" style="display:none;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Retour
        </button>
        <div class="salle__adblock-wrap">
          <label class="switch">
            <input type="checkbox" id="adblock-toggle" ${adblockEnabled ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
          <span class="adblock-label">Anti-Pub (Recommandé)</span>
        </div>
        <button class="salle__fermer" data-fermer-salle style="margin-left: auto;">Quitter la salle</button>
      </div>
      
      <div class="salle__ecran">
        <div id="salle-main-content"></div>
      </div>
      
      <div id="salle-episodes-container" style="display:none;"></div>
      
      <div class="salle__barre" id="salle-player-controls" style="display:none;">
        <div class="salle__controls-left">
          <span class="salle__now-playing" id="playing-title"></span>
        </div>
        <div class="salle__controls-center">
          <div class="salle__tabs" id="salle-versions"></div>
          <div class="salle__tabs" id="salle-players"></div>
        </div>
      </div>
    `;

    ouvre($("#salle"));
    
    // Auto-match check
    const cached = MatchCache.get(id);
    if (cached && cached.newsId) {
      selectStreamItem(cached.newsId);
    } else {
      showSalleLoading("Recherche automatique du flux...");
      try {
        let searchItems = await searchFrenchStream(c.titre);
        if (!searchItems || searchItems.length === 0) {
          if (c.court !== c.titre) {
            searchItems = await searchFrenchStream(c.court);
          }
        }
        
        let bestItem = null;
        let bestScore = -999;
        if (searchItems && searchItems.length > 0) {
          for (const item of searchItems) {
            const score = scoreMatch(c, item);
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestItem = item;
            }
          }
        }
        
        if (bestItem) {
          // Cache the match
          const matchData = {
            newsId: bestItem.id,
            poster: bestItem.poster,
            backdrop: null
          };
          MatchCache.set(c.id, matchData);
          applyPosterToCards(c.id, bestItem.poster);
          
          selectStreamItem(bestItem.id);
        } else {
          // Fall back to manual search list
          searchResultItems = searchItems || [];
          renderSearchResults();
        }
      } catch (e) {
        console.error("Auto-matching failed:", e);
        searchResultItems = [];
        renderSearchResults();
      }
    }
  }

  async function ouvreSalleDirect(newsId, title) {
    currentMovieId = null;
    currentNewsId = newsId;

    $("#salle-inner").innerHTML = `
      <div class="salle__header">
        <button class="salle__fermer-btn" id="btn-retour-recherche" style="display:none;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Retour
        </button>
        <div class="salle__adblock-wrap">
          <label class="switch">
            <input type="checkbox" id="adblock-toggle" ${adblockEnabled ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
          <span class="adblock-label">Anti-Pub (Recommandé)</span>
        </div>
        <button class="salle__fermer" data-fermer-salle style="margin-left: auto;">Quitter la salle</button>
      </div>
      
      <div class="salle__ecran">
        <div id="salle-main-content"></div>
      </div>
      
      <div id="salle-episodes-container" style="display:none;"></div>
      
      <div class="salle__barre" id="salle-player-controls" style="display:none;">
        <div class="salle__controls-left">
          <span class="salle__now-playing" id="playing-title"></span>
        </div>
        <div class="salle__controls-center">
          <div class="salle__tabs" id="salle-versions"></div>
          <div class="salle__tabs" id="salle-players"></div>
        </div>
      </div>
    `;

    ouvre($("#salle"));
    
    $("#playing-title").textContent = title || "Streaming";
    
    selectStreamItem(newsId);
  }

  /* ================= RECHERCHE ================= */
  let chercherDebounceTimer = null;
  let searchAbortController = null;

  function displayRecentSearches() {
    const box = $("#reche-resultats");
    const list = RecentSearches.get();
    if (list.length === 0) {
      box.innerHTML = `<p class="reche__vide">Tapez au moins 2 caractères pour lancer la recherche.</p>`;
      return;
    }
    
    box.innerHTML = `
      <div class="reche__header-row">
        <div class="reche__section-title">Recherches récentes</div>
        <button class="reche__clear-btn" id="btn-clear-history">Supprimer l'historique</button>
      </div>
      ${list.map(s => `
        <button class="reche__item" ${s.isLocal ? `data-fiche="${s.id}"` : `data-search-play="${s.id}" data-search-title="${s.title}"`}>
          <span class="reche__vig" style="${s.isLocal ? `background:${fond(parId(s.id))}` : `background-image:url('${s.poster}')`}" data-poster-id="${s.isLocal ? s.id : ''}">
            ${s.isLocal ? `<span>${parId(s.id).court[0]}</span>` : ''}
          </span>
          <span class="reche__info">
            <p class="reche__t">${s.title}</p>
            <p class="reche__m">${s.isLocal ? "Dans notre catalogue" : "En streaming direct"}</p>
          </span>
        </button>
      `).join("")}
    `;
    applyCachedSearchPosters();
  }

  function chercher(q) {
    const n = q.trim();
    if (n.length < 2) {
      if (searchAbortController) {
        searchAbortController.abort();
        searchAbortController = null;
      }
      displayRecentSearches();
      return;
    }

    const cleanN = sansAccent(n);
    const box = $("#reche-resultats");
    
    // 1. Show local catalogue results instantly
    const localRes = CATALOGUE.filter(c => {
      const foin = sansAccent([c.titre, c.court, c.genres.join(" "), c.realisateur, c.casting.join(" "), c.pays].join(" "));
      return foin.includes(cleanN);
    }).slice(0, 5);

    let html = "";
    if (localRes.length > 0) {
      html += `
        <div class="reche__section-title">Dans notre catalogue</div>
        ${localRes.map(c => `
          <button class="reche__item" data-fiche="${c.id}">
            <span class="reche__vig" style="background:${fond(c)}" data-poster-id="${c.id}"><span>${c.court[0]}</span></span>
            <span class="reche__info">
              <p class="reche__t">${c.titre}</p>
              <p class="reche__m">${c.annee} · ${c.duree} · ${c.genres.join(" / ")} · ★ ${c.note.toFixed(1)}</p>
            </span>
          </button>
        `).join("")}
      `;
    }

    box.innerHTML = html || `<p class="reche__vide">Recherche en cours...</p>`;
    applyCachedSearchPosters();

    // 2. Debounce and fetch French Stream suggestions in real-time
    clearTimeout(chercherDebounceTimer);
    chercherDebounceTimer = setTimeout(async () => {
      if (searchAbortController) {
        searchAbortController.abort();
      }
      searchAbortController = new AbortController();
      const signal = searchAbortController.signal;

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(n)}`, { signal });
        const items = await response.json();
        
        let liveHtml = "";
        if (items && items.length > 0) {
          liveHtml += `
            <div class="reche__section-title">Résultats French Stream</div>
            ${items.slice(0, 6).map(item => `
              <button class="reche__item" data-search-play="${item.id}" data-search-title="${item.title}">
                <span class="reche__vig" style="background-image: url('${item.poster}')"></span>
                <span class="reche__info">
                  <p class="reche__t">${item.title}</p>
                  <p class="reche__m">En streaming direct</p>
                </span>
              </button>
            `).join("")}
          `;
        }

        box.innerHTML = (html + liveHtml) || `<p class="reche__vide">Aucun résultat pour « ${n} ».</p>`;
        applyCachedSearchPosters();
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error("Live search failed:", e);
        }
      }
    }, 300);
  }

  /* ================= MODALES : ouvrir / fermer ================= */
  function ouvre(el) {
    dernierFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add("no-scroll");
    const cible = el.querySelector("input, button, [tabindex]");
    if (cible) cible.focus();
  }
  function ferme(el) {
    el.hidden = true;
    if (!$$(".fiche, .salle, .reche").some(m => !m.hidden)) document.body.classList.remove("no-scroll");
    if (dernierFocus) dernierFocus.focus();
  }

  /* ================= TOAST ================= */
  let toastTimer = null;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html; t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ================= SYNCHRO BOUTONS « MA LISTE » ================= */
  function syncBoutonsListe(id) {
    $$(`[data-liste="${id}"]`).forEach(b => {
      const dansFiche = b.closest(".fiche__actions");
      b.innerHTML = Liste.a(id)
        ? ICO.check + (dansFiche ? " Dans ma liste" : " Ma liste")
        : ICO.plus + " Ma liste";
    });
  }

  /* ================= OBSERVER (révélation des rails) ================= */
  function observeRails() {
    if (!("IntersectionObserver" in window)) { $$(".rail").forEach(r => r.classList.add("is-seen")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-seen"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".rail").forEach(r => io.observe(r));
  }

  /* ================= COMPTEUR ANIMÉ (manifeste) ================= */
  function compteur() {
    const el = $("#stat-titres"); const fin = CATALOGUE.length;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      let n = 0; const pas = Math.ceil(fin / 30);
      const t = setInterval(() => { n += pas; if (n >= fin) { n = fin; clearInterval(t); } el.textContent = n; }, 28);
    }, { threshold: .5 });
    io.observe(el);
  }

  /* ================= ÉVÉNEMENTS GLOBAUX ================= */
  function brancheEvenements() {
    // Délégation : tout clic sur [data-fiche]/[data-play]/[data-liste]/[data-voir]
    document.addEventListener("click", (e) => {
      const ficheBtn = e.target.closest("[data-fiche]");
      const playBtn  = e.target.closest("[data-play]");
      const searchPlayBtn = e.target.closest("[data-search-play]");
      const clearHistoryBtn = e.target.closest("#btn-clear-history");
      const listeBtn = e.target.closest("[data-liste]");
      const voirBtn  = e.target.closest("[data-voir]");
      const fermer   = e.target.closest("[data-fermer]");
      const fermerS  = e.target.closest("[data-fermer-salle]");

      if (clearHistoryBtn) {
        if (confirm("Supprimer toutes les recherches récentes ?")) {
          RecentSearches.clear();
          displayRecentSearches();
        }
        return;
      }

      if (searchPlayBtn) {
        ferme($("#reche"));
        const newsId = searchPlayBtn.dataset.searchPlay;
        const title = searchPlayBtn.dataset.searchTitle;
        
        let posterUrl = "";
        const vig = searchPlayBtn.querySelector(".reche__vig");
        if (vig) {
          const bg = vig.style.backgroundImage;
          if (bg && bg.startsWith('url("')) {
            posterUrl = bg.slice(5, -2);
          }
        }
        
        RecentSearches.save({
          id: newsId,
          title: title,
          poster: posterUrl,
          isLocal: false
        });

        const matchedLocal = CATALOGUE.find(c => {
          const cache = MatchCache.get(c.id);
          return cache && cache.newsId === newsId;
        });
        if (matchedLocal) {
          ouvreSalle(matchedLocal.id);
        } else {
          ouvreSalleDirect(newsId, title);
        }
        return;
      }
      if (playBtn)  { ouvreSalle(playBtn.dataset.play); return; }
      if (listeBtn) { Liste.bascule(listeBtn.dataset.liste); return; }
      if (voirBtn)  { const r = RAILS[+voirBtn.dataset.voir]; renderCollection(r.titre, r.sous, r.filtre); return; }
      if (fermerS)  { ferme($("#salle")); return; }
      if (fermer)   { ferme(fermer.closest(".fiche, .reche")); return; }
      if (ficheBtn) {
        if ($("#reche").hidden === false) {
          ferme($("#reche"));
          const c = parId(ficheBtn.dataset.fiche);
          if (c) {
            RecentSearches.save({
              id: c.id,
              title: c.titre,
              poster: "",
              isLocal: true
            });
          }
        }
        ouvreFiche(ficheBtn.dataset.fiche);
        return;
      }
    });

    // Clavier sur les cartes (Entrée / Espace)
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card")) {
        e.preventDefault(); ouvreFiche(e.target.dataset.fiche);
      }
    });

    // Nav : filtres
    $$(".nav__link").forEach(b => b.addEventListener("click", () => {
      $$(".nav__link").forEach(x => x.classList.remove("is-active"));
      b.classList.add("is-active");
      const f = b.dataset.filtre;
      if (f === "tout") renderRails();
      else if (f === "film") renderCollection("Films", "le grand écran", c => c.type === "film");
      else if (f === "serie") renderCollection("Séries", "à dévorer", c => c.type === "serie");
      else if (f === "Cinéma français") renderCollection("Made in France", "le cinéma d'ici", c => c.pays && c.pays.includes("France"));
    }));

    // Recherche
    $("#ouvrir-recherche").addEventListener("click", () => { ouvre($("#reche")); $("#reche-input").value = ""; displayRecentSearches(); });
    $("#reche-input").addEventListener("input", e => chercher(e.target.value));
    $("#ouvrir-liste").addEventListener("click", () => {
      if (!Liste.set.size) { toast("Votre liste est vide — ajoutez un titre avec <b>+</b>"); return; }
      renderCollection("Ma liste", "vos séances à venir", c => Liste.a(c.id));
      $$(".nav__link").forEach(x => x.classList.remove("is-active"));
    });

    // Raccourcis clavier
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("#salle").hidden) ferme($("#salle"));
        else if (!$("#fiche").hidden) ferme($("#fiche"));
        else if (!$("#reche").hidden) ferme($("#reche"));
      }
      const tape = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === "/" && !tape && $("#reche").hidden) { e.preventDefault(); ouvre($("#reche")); $("#reche-input").value = ""; displayRecentSearches(); }
    });

    // Voile : clic en dehors ferme
    $("#fiche").addEventListener("click", e => { if (e.target.classList.contains("fiche__voile")) ferme($("#fiche")); });
    $("#reche").addEventListener("click", e => { if (e.target.classList.contains("reche__voile")) ferme($("#reche")); });

    // Events for the Salle streaming interface (event delegation on #salle-inner)
    const salleInner = $("#salle-inner");
    if (salleInner) {
      salleInner.addEventListener("click", (e) => {
        const streamCard = e.target.closest("[data-stream-id]");
        const playerBtn = e.target.closest("[data-sel-player]");
        const versionBtn = e.target.closest("[data-sel-version]");
        const seriesVersionBtn = e.target.closest("[data-sel-series-version]");
        const episodeCard = e.target.closest("[data-sel-episode]");
        const backBtn = e.target.closest("#btn-retour-recherche");
        const searchBtn = e.target.closest("#btn-search-manual");

        if (streamCard) {
          selectStreamItem(streamCard.dataset.streamId);
        } else if (playerBtn) {
          activePlayerName = playerBtn.dataset.selPlayer;
          if (!isSeries) {
            // select first available version for the new player if current version doesn't exist
            const plist = playerData.players || {};
            const activePlayerObj = plist[activePlayerName.toLowerCase()];
            const versions = getAvailableVersions(activePlayerObj);
            if (!versions.some(v => v.key === activeVersionName)) {
              activeVersionName = versions[0] ? versions[0].key : 'default';
            }
          }
          renderPlayerControls();
          loadIframePlayer();
        } else if (versionBtn) {
          activeVersionName = versionBtn.dataset.selVersion;
          renderPlayerControls();
          loadIframePlayer();
        } else if (seriesVersionBtn) {
          activeVersionName = seriesVersionBtn.dataset.selSeriesVersion;
          
          // Reset episode to first available in this version
          const eps = Object.keys(playerData.episodes[activeVersionName] || {}).map(Number).sort((a,b)=>a-b);
          activeEpisodeNum = String(eps[0] || "1");
          
          // Reset player to first available for this episode
          const plist = getActivePlayers();
          const preferred = ["vidzy", "uqload", "voe", "filmoon", "netu", "premium"];
          activePlayerName = "";
          for (const p of preferred) {
            if (plist[p]) { activePlayerName = p; break; }
          }
          if (!activePlayerName) activePlayerName = Object.keys(plist)[0] || "";

          renderPlayerControls();
          loadIframePlayer();
        } else if (episodeCard) {
          activeEpisodeNum = episodeCard.dataset.selEpisode;

          // Reset player to first available for this episode
          const plist = getActivePlayers();
          const preferred = ["vidzy", "uqload", "voe", "filmoon", "netu", "premium"];
          activePlayerName = "";
          for (const p of preferred) {
            if (plist[p]) { activePlayerName = p; break; }
          }
          if (!activePlayerName) activePlayerName = Object.keys(plist)[0] || "";

          renderPlayerControls();
          loadIframePlayer();
        } else if (backBtn) {
          renderSearchResults();
        } else if (searchBtn) {
          const q = $("#input-search-manual").value.trim();
          if (q) performManualSearch(q);
        }
      });

      // Handle enter key in manual search input
      salleInner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.id === "input-search-manual") {
          const q = e.target.value.trim();
          if (q) performManualSearch(q);
        }
      });

      // Debounce manual search input inside the room
      let manualSearchDebounceTimer = null;
      salleInner.addEventListener("input", (e) => {
        if (e.target.id === "input-search-manual") {
          const q = e.target.value.trim();
          clearTimeout(manualSearchDebounceTimer);
          if (q.length > 2) {
            manualSearchDebounceTimer = setTimeout(() => {
              performManualSearch(q);
            }, 350);
          }
        }
      });

      // Handle Adblock toggle change
      salleInner.addEventListener("change", (e) => {
        if (e.target.id === "adblock-toggle") {
          adblockEnabled = e.target.checked;
          if (playerData) {
            loadIframePlayer();
          }
        }
      });
    }
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    Liste.init();
    MatchCache.init();
    construitDots();
    relanceCarousel(0);
    renderRails();
    compteur();
    brancheEvenements();
    loadPostersInBackground();
  });
})();
