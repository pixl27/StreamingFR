/* ============================================================
   CINÉMATHÈQUE — Catalogue de démonstration
   Métadonnées factuelles + synopsis originaux (loglines).
   Aucun flux, aucune image sous copyright : les affiches sont
   composées en CSS à partir des duos de couleurs ci-dessous.
   Branchez une vraie source (TMDB, votre CDN…) en remplaçant
   ce fichier ou en mappant ses champs.
   ============================================================ */

const CATALOGUE = [
  // ---------------- CINÉMA FRANÇAIS ----------------
  {
    id: "amelie",
    titre: "Le Fabuleux Destin d'Amélie Poulain",
    court: "Amélie",
    annee: 2001, duree: "2h02", type: "film", note: 4.7,
    genres: ["Comédie", "Romance"], pays: "France", langue: "VF",
    grad: ["#E8552D", "#3B7A57"],
    casting: ["Audrey Tautou", "Mathieu Kassovitz", "Rufus"],
    realisateur: "Jean-Pierre Jeunet",
    synopsis: "Une serveuse de Montmartre se donne pour mission secrète de réparer la vie des autres, un petit bonheur à la fois."
  },
  {
    id: "lahaine",
    titre: "La Haine", court: "La Haine",
    annee: 1995, duree: "1h38", type: "film", note: 4.8,
    genres: ["Drame"], pays: "France", langue: "VF",
    grad: ["#1C1C1C", "#5A5A5A"],
    casting: ["Vincent Cassel", "Hubert Koundé", "Saïd Taghmaoui"],
    realisateur: "Mathieu Kassovitz",
    synopsis: "Vingt-quatre heures dans la vie de trois amis de banlieue, après une nuit d'émeutes qui a tout fait basculer."
  },
  {
    id: "intouchables",
    titre: "Intouchables", court: "Intouchables",
    annee: 2011, duree: "1h52", type: "film", note: 4.6,
    genres: ["Comédie", "Drame"], pays: "France", langue: "VF",
    grad: ["#0E5A8A", "#E8A33D"],
    casting: ["François Cluzet", "Omar Sy", "Anne Le Ny"],
    realisateur: "Olivier Nakache, Éric Toledano",
    synopsis: "Un aristocrate tétraplégique engage comme aide à domicile un jeune homme tout juste sorti de prison. Une amitié improbable."
  },
  {
    id: "portrait",
    titre: "Portrait de la jeune fille en feu", court: "Portrait",
    annee: 2019, duree: "2h02", type: "film", note: 4.6,
    genres: ["Drame", "Romance"], pays: "France", langue: "VF",
    grad: ["#1B2A4A", "#C85A2E"],
    casting: ["Noémie Merlant", "Adèle Haenel", "Luàna Bajrami"],
    realisateur: "Céline Sciamma",
    synopsis: "Sur une île bretonne au XVIIIᵉ siècle, une peintre doit faire en secret le portrait d'une jeune femme promise au mariage."
  },
  {
    id: "leon",
    titre: "Léon", court: "Léon",
    annee: 1994, duree: "1h50", type: "film", note: 4.7,
    genres: ["Thriller", "Action"], pays: "France", langue: "VF",
    grad: ["#2A1B2E", "#4FA89B"],
    casting: ["Jean Reno", "Natalie Portman", "Gary Oldman"],
    realisateur: "Luc Besson",
    synopsis: "Un tueur à gages solitaire prend sous son aile une fillette de douze ans dont la famille vient d'être assassinée."
  },
  {
    id: "unprophete",
    titre: "Un Prophète", court: "Un Prophète",
    annee: 2009, duree: "2h35", type: "film", note: 4.5,
    genres: ["Crime", "Drame"], pays: "France", langue: "VF",
    grad: ["#3A2A1A", "#8A6A3A"],
    casting: ["Tahar Rahim", "Niels Arestrup", "Adel Bencherif"],
    realisateur: "Jacques Audiard",
    synopsis: "Incarcéré à dix-neuf ans, un jeune homme illettré gravit un à un les échelons du milieu carcéral jusqu'à le dominer."
  },
  {
    id: "oss117",
    titre: "OSS 117 : Le Caire, nid d'espions", court: "OSS 117",
    annee: 2006, duree: "1h39", type: "film", note: 4.3,
    genres: ["Comédie"], pays: "France", langue: "VF",
    grad: ["#C49A3A", "#1E5A6E"],
    casting: ["Jean Dujardin", "Bérénice Bejo", "Aure Atika"],
    realisateur: "Michel Hazanavicius",
    synopsis: "Un agent secret français aussi sûr de lui qu'à côté de la plaque débarque dans l'Égypte de 1955 pour rétablir l'ordre."
  },
  {
    id: "leschoristes",
    titre: "Les Choristes", court: "Les Choristes",
    annee: 2004, duree: "1h37", type: "film", note: 4.4,
    genres: ["Drame", "Musique"], pays: "France", langue: "VF",
    grad: ["#2E3A2A", "#B8A05A"],
    casting: ["Gérard Jugnot", "François Berléand", "Jean-Baptiste Maunier"],
    realisateur: "Christophe Barratier",
    synopsis: "Dans un internat d'après-guerre, un surveillant compose pour des enfants difficiles une chorale qui va tout changer."
  },

  // ---------------- GRAND CINÉMA INTERNATIONAL ----------------
  {
    id: "dune",
    titre: "Dune", court: "Dune",
    annee: 2021, duree: "2h35", type: "film", note: 4.5,
    genres: ["Science-fiction", "Aventure"], pays: "USA", langue: "VOSTFR",
    grad: ["#B5651D", "#3E2A14"],
    casting: ["Timothée Chalamet", "Rebecca Ferguson", "Zendaya"],
    realisateur: "Denis Villeneuve",
    synopsis: "L'héritier d'une grande maison noble est précipité dans une guerre pour la planète la plus convoitée de l'univers : le désert d'Arrakis."
  },
  {
    id: "bladerunner",
    titre: "Blade Runner 2049", court: "Blade Runner 2049",
    annee: 2017, duree: "2h44", type: "film", note: 4.4,
    genres: ["Science-fiction", "Thriller"], pays: "USA", langue: "VOSTFR",
    grad: ["#C8442E", "#1A2E3A"],
    casting: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
    realisateur: "Denis Villeneuve",
    synopsis: "Un traqueur d'androïdes exhume un secret enfoui depuis longtemps qui pourrait plonger ce qui reste de la société dans le chaos."
  },
  {
    id: "interstellar",
    titre: "Interstellar", court: "Interstellar",
    annee: 2014, duree: "2h49", type: "film", note: 4.7,
    genres: ["Science-fiction", "Drame"], pays: "USA", langue: "VOSTFR",
    grad: ["#1B2740", "#6E7B8A"],
    casting: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    realisateur: "Christopher Nolan",
    synopsis: "Alors que la Terre se meurt, une poignée d'explorateurs franchit un trou de ver pour chercher à l'humanité un nouveau foyer."
  },
  {
    id: "inception",
    titre: "Inception", court: "Inception",
    annee: 2010, duree: "2h28", type: "film", note: 4.6,
    genres: ["Science-fiction", "Action"], pays: "USA", langue: "VOSTFR",
    grad: ["#2A3340", "#A8742E"],
    casting: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
    realisateur: "Christopher Nolan",
    synopsis: "Un voleur capable d'infiltrer les rêves se voit offrir l'effacement de son passé en échange d'un ultime casse : implanter une idée."
  },
  {
    id: "oppenheimer",
    titre: "Oppenheimer", court: "Oppenheimer",
    annee: 2023, duree: "3h00", type: "film", note: 4.6,
    genres: ["Drame", "Histoire"], pays: "USA", langue: "VOSTFR",
    grad: ["#7A2E2E", "#1A1A1A"],
    casting: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
    realisateur: "Christopher Nolan",
    synopsis: "L'histoire du physicien qui dirigea la mise au point de la bombe atomique — et passa le reste de sa vie à en mesurer le prix."
  },
  {
    id: "parasite",
    titre: "Parasite", court: "Parasite",
    annee: 2019, duree: "2h12", type: "film", note: 4.8,
    genres: ["Thriller", "Drame"], pays: "Corée", langue: "VOSTFR",
    grad: ["#3A5A3A", "#1A1A1A"],
    casting: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    realisateur: "Bong Joon-ho",
    synopsis: "Une famille pauvre s'infiltre une à une au service d'une famille richissime — jusqu'à ce qu'un secret enfoui fasse tout déraper."
  },
  {
    id: "whiplash",
    titre: "Whiplash", court: "Whiplash",
    annee: 2014, duree: "1h47", type: "film", note: 4.6,
    genres: ["Drame", "Musique"], pays: "USA", langue: "VOSTFR",
    grad: ["#1A1A1A", "#B89020"],
    casting: ["Miles Teller", "J.K. Simmons", "Melissa Benoist"],
    realisateur: "Damien Chazelle",
    synopsis: "Un jeune batteur ambitieux tombe sous la coupe d'un professeur tyrannique prêt à tout pour révéler un génie — ou le briser."
  },
  {
    id: "joker",
    titre: "Joker", court: "Joker",
    annee: 2019, duree: "2h02", type: "film", note: 4.4,
    genres: ["Drame", "Crime"], pays: "USA", langue: "VOSTFR",
    grad: ["#3A2A4A", "#6E8A3A"],
    casting: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz"],
    realisateur: "Todd Phillips",
    synopsis: "Méprisé par une ville qui l'ignore, un comédien raté bascule peu à peu dans la folie et devient le visage d'une révolte."
  },
  {
    id: "lotr",
    titre: "Le Seigneur des Anneaux : La Communauté de l'Anneau", court: "La Communauté de l'Anneau",
    annee: 2001, duree: "2h58", type: "film", note: 4.8,
    genres: ["Fantasy", "Aventure"], pays: "Nouvelle-Zélande", langue: "VOSTFR",
    grad: ["#2A3A2A", "#9A7A3A"],
    casting: ["Elijah Wood", "Ian McKellen", "Viggo Mortensen"],
    realisateur: "Peter Jackson",
    synopsis: "Un jeune hobbit hérite d'un anneau qui peut asservir le monde, et part avec huit compagnons le détruire au cœur du pays ennemi."
  },
  {
    id: "eeaao",
    titre: "Everything Everywhere All at Once", court: "Everything Everywhere",
    annee: 2022, duree: "2h19", type: "film", note: 4.4,
    genres: ["Science-fiction", "Comédie"], pays: "USA", langue: "VOSTFR",
    grad: ["#C8348A", "#2E8AC8"],
    casting: ["Michelle Yeoh", "Ke Huy Quan", "Jamie Lee Curtis"],
    realisateur: "Daniel Kwan, Daniel Scheinert",
    synopsis: "Une gérante de laverie débordée découvre qu'elle seule peut sauver le multivers en se connectant à ses innombrables autres vies."
  },

  // ---------------- SÉRIES ----------------
  {
    id: "lupin",
    titre: "Lupin", court: "Lupin",
    annee: 2021, duree: "Série · 3 saisons", type: "serie", note: 4.4,
    genres: ["Crime", "Aventure"], pays: "France", langue: "VF",
    grad: ["#1A2E4A", "#C89A3A"],
    casting: ["Omar Sy", "Ludivine Sagnier", "Clotilde Hesme"],
    realisateur: "George Kay, François Uzan",
    synopsis: "Inspiré d'Arsène Lupin, un gentleman-cambrioleur orchestre une vengeance élégante contre l'homme qui a brisé sa famille."
  },
  {
    id: "bureau",
    titre: "Le Bureau des Légendes", court: "Le Bureau des Légendes",
    annee: 2015, duree: "Série · 5 saisons", type: "serie", note: 4.7,
    genres: ["Espionnage", "Drame"], pays: "France", langue: "VF",
    grad: ["#1E2A2E", "#7A5A2E"],
    casting: ["Mathieu Kassovitz", "Sara Giraudeau", "Jean-Pierre Darroussin"],
    realisateur: "Éric Rochant",
    synopsis: "Au cœur de la DGSE, des agents infiltrés vivent sous une fausse identité pendant des années — au risque de s'y perdre."
  },
  {
    id: "dixpourcent",
    titre: "Dix pour cent", court: "Dix pour cent",
    annee: 2015, duree: "Série · 4 saisons", type: "serie", note: 4.5,
    genres: ["Comédie", "Drame"], pays: "France", langue: "VF",
    grad: ["#8A2E4A", "#2E3A5A"],
    casting: ["Camille Cottin", "Thibault de Montalembert", "Grégory Montel"],
    realisateur: "Fanny Herrero",
    synopsis: "Dans une agence d'acteurs parisienne, des agents survoltés jonglent avec les caprices des stars et leurs propres vies en miettes."
  },
  {
    id: "engrenages",
    titre: "Engrenages", court: "Engrenages",
    annee: 2005, duree: "Série · 8 saisons", type: "serie", note: 4.4,
    genres: ["Policier", "Drame"], pays: "France", langue: "VF",
    grad: ["#2A2A2E", "#6E2E2E"],
    casting: ["Caroline Proust", "Audrey Fleurot", "Thierry Godard"],
    realisateur: "Alexandra Clert",
    synopsis: "Police, justice et avocats s'affrontent dans les rouages d'un système judiciaire parisien où la frontière du bien recule sans cesse."
  },
  {
    id: "breakingbad",
    titre: "Breaking Bad", court: "Breaking Bad",
    annee: 2008, duree: "Série · 5 saisons", type: "serie", note: 4.9,
    genres: ["Crime", "Drame"], pays: "USA", langue: "VOSTFR",
    grad: ["#2E4A2E", "#C8B83A"],
    casting: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    realisateur: "Vince Gilligan",
    synopsis: "Un professeur de chimie atteint d'un cancer se lance dans la fabrication de méthamphétamine pour assurer l'avenir des siens."
  },
  {
    id: "dark",
    titre: "Dark", court: "Dark",
    annee: 2017, duree: "Série · 3 saisons", type: "serie", note: 4.6,
    genres: ["Science-fiction", "Thriller"], pays: "Allemagne", langue: "VOSTFR",
    grad: ["#1A2E2E", "#3A4A5A"],
    casting: ["Louis Hofmann", "Lisa Vicari", "Oliver Masucci"],
    realisateur: "Baran bo Odar, Jantje Friese",
    synopsis: "La disparition d'un enfant révèle, dans une petite ville allemande, un secret qui relie quatre familles à travers les époques."
  },
  {
    id: "severance",
    titre: "Severance", court: "Severance",
    annee: 2022, duree: "Série · 2 saisons", type: "serie", note: 4.6,
    genres: ["Science-fiction", "Thriller"], pays: "USA", langue: "VOSTFR",
    grad: ["#1E3A4A", "#8AB8C8"],
    casting: ["Adam Scott", "Britt Lower", "Patricia Arquette"],
    realisateur: "Dan Erickson",
    synopsis: "Des employés acceptent une opération qui sépare leurs souvenirs du travail de ceux de leur vie privée — jusqu'à ce que les deux mondes s'entrechoquent."
  },
  {
    id: "arcane",
    titre: "Arcane", court: "Arcane",
    annee: 2021, duree: "Série · 2 saisons", type: "serie", note: 4.7,
    genres: ["Animation", "Science-fiction"], pays: "France/USA", langue: "VF",
    grad: ["#3A2E6E", "#C84A8A"],
    casting: ["Hailee Steinfeld", "Ella Purnell", "Kevin Alejandro"],
    realisateur: "Christian Linke, Alex Yee",
    synopsis: "Deux sœurs se retrouvent de part et d'autre d'une guerre entre une cité prospère et les bas-fonds qu'elle exploite."
  },
  {
    id: "chernobyl",
    titre: "Chernobyl", court: "Chernobyl",
    annee: 2019, duree: "Mini-série", type: "serie", note: 4.8,
    genres: ["Drame", "Histoire"], pays: "USA/UK", langue: "VOSTFR",
    grad: ["#3A3A2E", "#6E7A4A"],
    casting: ["Jared Harris", "Stellan Skarsgård", "Emily Watson"],
    realisateur: "Craig Mazin",
    synopsis: "Le récit heure par heure de la pire catastrophe nucléaire de l'histoire — et du mensonge d'État qui l'a aggravée."
  },
  {
    id: "peaky",
    titre: "Peaky Blinders", court: "Peaky Blinders",
    annee: 2013, duree: "Série · 6 saisons", type: "serie", note: 4.5,
    genres: ["Crime", "Drame"], pays: "UK", langue: "VOSTFR",
    grad: ["#1A1A1A", "#5A4A3A"],
    casting: ["Cillian Murphy", "Paul Anderson", "Helen McCrory"],
    realisateur: "Steven Knight",
    synopsis: "Dans le Birmingham d'après 1918, une famille de gangsters ambitieux étend son empire la lame cousue dans la casquette."
  },
  {
    id: "lastofus",
    titre: "The Last of Us", court: "The Last of Us",
    annee: 2023, duree: "Série · 2 saisons", type: "serie", note: 4.5,
    genres: ["Drame", "Science-fiction"], pays: "USA", langue: "VOSTFR",
    grad: ["#2E3A2E", "#8A6A4A"],
    casting: ["Pedro Pascal", "Bella Ramsey", "Anna Torv"],
    realisateur: "Craig Mazin, Neil Druckmann",
    synopsis: "Vingt ans après l'effondrement, un contrebandier endurci doit escorter à travers le pays une adolescente qui pourrait tout changer."
  },
  {
    id: "casadepapel",
    titre: "La Casa de Papel", court: "La Casa de Papel",
    annee: 2017, duree: "Série · 5 saisons", type: "serie", note: 4.2,
    genres: ["Crime", "Thriller"], pays: "Espagne", langue: "VF",
    grad: ["#B82E2E", "#1A1A1A"],
    casting: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño"],
    realisateur: "Álex Pina",
    synopsis: "Un cerveau du crime recrute huit hors-la-loi pour le casse le plus ambitieux de l'histoire : imprimer leur propre rançon."
  },
  {
    id: "stranger",
    titre: "Stranger Things", court: "Stranger Things",
    annee: 2016, duree: "Série · 4 saisons", type: "serie", note: 4.4,
    genres: ["Science-fiction", "Horreur"], pays: "USA", langue: "VF",
    grad: ["#6E1A1A", "#1A1A2E"],
    casting: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
    realisateur: "The Duffer Brothers",
    synopsis: "Dans une petite ville des années 80, la disparition d'un enfant ouvre la porte d'un monde parallèle et d'une fillette aux pouvoirs étranges."
  }
];

/* Rails de la page d'accueil — chaque rail filtre le catalogue. */
const RAILS = [
  {
    titre: "Tendances cette semaine",
    sous: "Ce que tout le monde regarde",
    filtre: c => ["dune", "lupin", "oppenheimer", "severance", "arcane", "lastofus", "parasite", "casadepapel"].includes(c.id)
  },
  {
    titre: "Nouveautés",
    sous: "Fraîchement ajoutés",
    filtre: c => c.annee >= 2019
  },
  {
    titre: "Cinéma français",
    sous: "La sélection de la maison",
    filtre: c => c.pays && c.pays.includes("France") && c.type === "film"
  },
  {
    titre: "Séries à dévorer",
    sous: "Un épisode… ou toute la nuit",
    filtre: c => c.type === "serie"
  },
  {
    titre: "Science-fiction & au-delà",
    sous: "Pour repousser le réel",
    filtre: c => c.genres.includes("Science-fiction")
  },
  {
    titre: "Note d'or · 4.6 et plus",
    sous: "Les incontournables",
    filtre: c => c.note >= 4.6
  }
];

/* Sélection mise en avant dans le hero (le « générique »). */
const VEDETTES = ["dune", "portrait", "arcane", "bladerunner", "oppenheimer"];
