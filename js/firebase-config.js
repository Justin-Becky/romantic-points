/* ============================================
   Configuration Firebase
   1. Va sur https://console.firebase.google.com
   2. Crée un projet, ajoute une app Web (</>)
   3. Copie ta config ici à la place des "COLLE_..."
   Tant que la config n'est pas remplie, l'app
   fonctionne en mode local (localStorage).
   ============================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyAGv2pbDGhXjsGoAePHSuQnsxNSy1fHagk",
  authDomain: "romantic-points-caa04.firebaseapp.com",
  projectId: "romantic-points-caa04",
  storageBucket: "romantic-points-caa04.firebasestorage.app",
  messagingSenderId: "804644764715",
  appId: "1:804644764715:web:3a4042e49f5e12b99b3e6e"
};
/* ============================================
   Sécurité 🔒
   Les courriels Google autorisés à utiliser l'app
   (toi et ta blonde). Mets les mêmes dans les
   règles Firestore (voir README).
   ============================================ */

export const allowedEmails = [
  "justin.arseneault08@gmail.com",
  "rebeccalemieux6@gmail.com"
];
/* ============================================
   Personnalisation des icônes 🎨
   Mets le chemin d'une de tes images (ex: "icons/coeur.png")
   pour remplacer un emoji. Laisse "" pour garder l'emoji.
   ============================================ */

export const customIcons = {
  logo: "", // logo en haut à gauche
  wallet: "icons/coins.png", // icône à côté du solde de points
  navHome: "icons/coins.png", // onglet Points
  navStats: "icons/stats.png", // onglet Stats
  navHistory: "icons/historique.png", // onglet Historique
  navShop: "icons/shop1.png" // onglet Magasin
};
