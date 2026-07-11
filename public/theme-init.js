// Applique le thème (clair/sombre) avant le premier paint pour éviter le flash.
// Fichier externe volontairement : un script inline rendu par React déclenche
// en dev le warning « script tag while rendering React component » (React 19).
(function () {
  try {
    var t = localStorage.getItem("theme") || "dark";
    var d =
      t === "dark" ||
      (t === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (d) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
