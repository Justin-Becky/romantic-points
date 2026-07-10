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

## Sécuriser l'app (connexion Google) 🔒

L'app a un écran de connexion Google intégré. Pour l'activer:

1. Dans Firebase: **Build → Authentication → Get started → Sign-in method → Google → Activer** (choisis ton courriel comme support), puis Save.
2. Toujours dans Authentication: **Settings → Authorized domains → Add domain** et ajoute `TON-USERNAME.github.io`.
3. Ouvre `js/firebase-config.js` et mets vos deux courriels Google dans `allowedEmails` (en minuscules).
4. Dans **Firestore → Règles**, colle ceci (avec vos vrais courriels) puis **Publier**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email in [
          'justin.arseneault@icloud.com',
          'courriel.de.ta.blonde@gmail.com'
        ];
    }
  }
}
```

Résultat: seuls vos deux comptes Google peuvent lire ou modifier les points, même si quelqu'un trouve l'URL. Vous vous connectez une fois par appareil et ça reste connecté.

⚠️ Note: la connexion Google demande un compte Google. Si ton adresse iCloud n'est pas liée à un compte Google, crée-toi un compte Google ou dis-moi de passer à l'option courriel/mot de passe.

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
