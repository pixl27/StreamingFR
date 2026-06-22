# Cinémathèque

Une plateforme de streaming pensée comme **une salle obscure dans votre salon**.
Refonte de design complète, à des années-lumière d'un clone générique : encre bleu-nuit,
lumière ambrée du projecteur, grain argentique, cadre cinémascope, affiches composées
à la main. HTML / CSS / JS pur — **aucune dépendance, aucun build**.

> ⚠️ **Démonstration de design.** Catalogue fictif, aucun flux vidéo réel n'est diffusé.
> Les titres et métadonnées sont factuels, les synopsis sont originaux, les affiches sont
> générées en CSS (aucune image sous copyright). Ce projet **ne reproduit pas** et ne
> remplace pas un service de streaming illégal — il vous donne l'**interface** pour
> brancher votre propre source **légale** (votre CDN, une API officielle, vos propres films…).

---

## Lancer le site

Le plus simple — **double-cliquez sur `index.html`**. C'est tout.

Pour servir proprement (recommandé, évite les limites de `file://` comme le stockage local) :

```bash
# au choix
python -m http.server 8080
npx serve .
```

puis ouvrez <http://localhost:8080>.

---

## La direction artistique

| Axe | Choix | Le geste |
|---|---|---|
| **Couleur** | Encre `#0A0B11` · **ambre projecteur `#F0A848`** · ivoire `#F4EFE4` · cinabre `#E5484D` (rare) | L'accent n'est pas le rouge Netflix mais la **lumière chaude du projecteur**. |
| **Typo** | **Bricolage Grotesque** (display) · Inter (UI) · **Space Mono** (fiche technique) | Le mono n'est pas décoratif : il porte la *fiche technique* d'archive. |
| **Signature** | Le **faisceau ambré** + grain + cadre **cinémascope** | On est physiquement assis dans une salle. |
| **Mouvement** | Allumage du projecteur, révélation au scroll, lift + halo au survol | Une séquence orchestrée, pas des effets dispersés. *(Respecte `prefers-reduced-motion`.)* |

---

## Ce qu'il y a dedans

- **Hero / générique** — carrousel des vedettes, dégradé propre à chaque titre, fiche technique en mono.
- **Rails** — Tendances, Nouveautés, Cinéma français, Séries, SF, Note d'or. Défilement horizontal, survol animé.
- **Fiche** — modale détaillée : synopsis, réalisation, distribution, format, chips de genres.
- **Projection** — lecteur *maquette* (clairement signalé comme démo, prêt à recevoir un vrai `<video>`).
- **Recherche** — `/` pour ouvrir, filtrage instantané et **insensible aux accents** (titre, genre, réalisateur, casting).
- **Ma liste** — ajout/retrait, compteur, persistance via `localStorage`, notifications *toast*.
- **Filtres de nav** — À l'affiche · Films · Séries · Made in France.
- **Accessible** — navigation clavier, focus visible, lien d'évitement, `aria-*`, mouvement réduit honoré.
- **Responsive** — du grand écran au mobile.

### Raccourcis clavier
- `/` — ouvrir la recherche
- `Échap` — fermer la modale / la recherche / la salle
- `Entrée` / `Espace` sur une affiche — ouvrir la fiche

---

## Fichiers

```
index.html   structure
styles.css   le système de design (tokens, atmosphère, hero, rails, modales, responsive)
app.js       interactions (hero, rails, fiche, projection, recherche, ma liste)
data.js      le catalogue de démonstration  ← remplacez-le par votre source
```

## Brancher une vraie source (légale)

Tout part de `data.js` : un tableau `CATALOGUE` d'objets. Pour utiliser, par exemple,
l'API **TMDB** (gratuite, officielle, prévue pour ça), mappez ses champs vers ce format :

```js
{
  id, titre, court, annee, duree, type: "film" | "serie", note,   // note /5
  genres: [], pays, langue: "VF" | "VOSTFR",
  grad: ["#hex", "#hex"],          // duo de couleurs de l'affiche (ou une vraie image)
  casting: [], realisateur, synopsis
}
```

Pour afficher de **vraies affiches** plutôt que les compositions CSS, ajoutez un champ
`image` et remplacez `background: fond(c)` par `background-image` dans `app.js`
(fonctions `carte`, `montreVedette`, `ouvreFiche`). Pour la **lecture réelle**, remplacez
la maquette « salle » par votre lecteur et **votre source autorisée**.
