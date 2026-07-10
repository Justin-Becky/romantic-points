/* ============================================
   Configuration Firebase
   1. Va sur https://console.firebase.google.com
   2. Crée un projet, ajoute une app Web (</>)
   3. Copie ta config ici à la place des "COLLE_..."
   Tant que la config n'est pas remplie, l'app
   fonctionne en mode local (localStorage).
   ============================================ */

export const firebaseConfig = {
  apiKey: "COLLE_TA_API_KEY",
  authDomain: "COLLE_TON_AUTH_DOMAIN",
  projectId: "COLLE_TON_PROJECT_ID",
  storageBucket: "COLLE_TON_STORAGE_BUCKET",
  messagingSenderId: "COLLE_TON_SENDER_ID",
  appId: "COLLE_TON_APP_ID"
};

/* ============================================
   Personnalisation des icônes 🎨
   Mets le chemin d'une de tes images (ex: "icons/coeur.png")
   pour remplacer un emoji. Laisse "" pour garder l'emoji.
   ============================================ */

export const customIcons = {
  logo: "", // logo en haut à gauche
  wallet: "", // icône à côté du solde de points
  navHome: "", // onglet Points
  navStats: "", // onglet Stats
  navHistory: "", // onglet Historique
  navShop: "" // onglet Magasin
};
