# Romantic Points 💖

Une app mignonne pour donner (ou enlever!) des points romantiques.

4 pages: donner des points, statistiques avec graphique, historique des transactions, et magasin de récompenses.

## Tester tout de suite

Ouvre `index.html` dans ton navigateur. Sans Firebase, l'app fonctionne en **mode local** (les données restent sur l'appareil). Parfait pour tester, mais ta blonde et toi ne verrez pas les mêmes données sur deux téléphones. Pour partager les données, configure Firebase (2 minutes, gratuit).

## Configurer Firebase (base de données partagée)

1. Va sur https://console.firebase.google.com et connecte-toi avec un compte Google.
2. Clique **Créer un projet**, donne-lui un nom (ex: `romantic-points`), désactive Analytics, crée.
3. Dans le menu de gauche: **Build → Firestore Database → Créer une base de données**. Choisis **mode test** pour commencer (région: `northamerica-northeast1` = Montréal).
4. Retourne à la page d'accueil du projet, clique l'icône **`</>`** (app Web), donne un nom, **pas besoin** de Firebase Hosting.
5. Firebase t'affiche un bloc `const firebaseConfig = { ... }`. Copie les valeurs dans `js/firebase-config.js` à la place des `COLLE_...`.
6. C'est tout! L'app se synchronise en temps réel entre vos deux téléphones.

⚠️ Le mode test de Firestore expire après 30 jours. Ensuite, dans **Firestore → Règles**, mets:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

(C'est ouvert à tous ceux qui ont l'URL — correct pour une app perso à deux, mais ne mets rien de privé dedans.)

## Déployer sur GitHub Pages

1. Crée un repo sur https://github.com (ex: `romantic-points`), public.
2. Téléverse tous les fichiers de ce dossier (bouton **uploading an existing file** ou avec git).
3. Dans le repo: **Settings → Pages → Source: Deploy from a branch → Branch: main → / (root) → Save**.
4. Après ~1 minute, l'app est en ligne à `https://TON-USERNAME.github.io/romantic-points/`.

## Mettre sur l'écran d'accueil du iPhone

1. Ouvre l'URL GitHub Pages dans **Safari**.
2. Bouton **Partager** (carré avec flèche) → **Sur l'écran d'accueil**.
3. L'app apparaît avec sa jolie icône cœur rose et s'ouvre en plein écran. 💗

## Personnaliser les boutons et icônes avec tes images

1. Mets tes images dans le dossier `icons/` (ex: `icons/mon-coeur.png`).
2. Ouvre `js/firebase-config.js` et remplis `customIcons`:

```js
export const customIcons = {
  logo: "icons/mon-coeur.png", // logo en haut à gauche
  wallet: "", // icône à côté du solde
  navHome: "", // onglet Points
  navStats: "", // onglet Stats
  navHistory: "", // onglet Historique
  navShop: "" // onglet Magasin
};
```

3. Dans le magasin, chaque item peut aussi avoir sa propre image: écris le chemin (ex: `icons/calin.png`) dans le champ "Emoji ou chemin d'image".
4. Les couleurs se changent en haut de `css/style.css` dans la section `:root`.

## Structure des fichiers

- `index.html` — les 4 pages de l'app
- `css/style.css` — le style (couleurs modifiables dans `:root`)
- `js/app.js` — la logique
- `js/firebase-config.js` — ta config Firebase + icônes personnalisées
- `manifest.json` — pour l'installation sur téléphone
- `icons/` — les icônes de l'app (et tes images perso)
