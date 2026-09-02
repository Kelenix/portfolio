# 🚀 Mémo déploiement & gestion — VPS Hostinger

Aide-mémoire pour gérer le portfolio en production. Toutes les commandes se lancent **sur le VPS** (via SSH), sauf mention « en local ».

## 📌 Infos de l'installation

| Élément | Valeur |
|---|---|
| Domaine | `https://lionel-dev.site` |
| IP du VPS | `69.62.116.243` |
| Dossier du projet | `/var/www/portfolio` |
| Port interne (Next.js) | `3002` |
| Nom du process PM2 | `portfolio` |
| Base de données | Supabase (distante, rien à héberger sur le VPS) |
| Serveur web | nginx (reverse proxy → port 3002) |
| SSL | Let's Encrypt (renouvellement auto par certbot) |

> ⚠️ Le port `3002` est **interne** : ne jamais le mettre dans l'URL du navigateur. On accède au site par `https://lionel-dev.site` (nginx s'occupe de router vers 3002).

---

## 🔌 1. Se connecter au VPS

```bash
ssh root@69.62.116.243
```

Puis aller dans le projet :

```bash
cd /var/www/portfolio
```

---

## 🔄 2. Déployer des modifications (le plus fréquent)

Une fois que tu as poussé tes changements sur GitHub (en local : `git push`), sur le VPS :

```bash
cd /var/www/portfolio && git pull && npm install && npm run build && pm2 restart portfolio
```

Détail de ce que fait chaque étape :

| Commande | Rôle |
|---|---|
| `git pull` | Récupère ton nouveau code depuis GitHub |
| `npm install` | Installe les nouvelles dépendances (si le `package.json` a changé) |
| `npm run build` | Recompile l'app (`prisma generate && next build`) |
| `pm2 restart portfolio` | Redémarre l'app avec le nouveau code |

> 💡 Si tu n'as changé que du code (pas de nouvelle dépendance), tu peux sauter `npm install`.

---

## ⚙️ 3. Gérer le process avec PM2

```bash
pm2 list                    # Voir toutes les apps et leur état
pm2 restart portfolio       # Redémarrer l'app
pm2 stop portfolio          # Arrêter l'app
pm2 start portfolio         # Démarrer l'app
pm2 logs portfolio          # Voir les logs en direct (Ctrl+C pour quitter)
pm2 logs portfolio --lines 100   # Voir les 100 dernières lignes de logs
pm2 monit                   # Tableau de bord temps réel (CPU / mémoire)
pm2 save                    # Sauvegarder l'état (à faire après un changement de config)
```

### Relancer l'app en rechargeant le fichier .env
PM2 garde en mémoire les variables d'environnement. **Après avoir modifié le `.env`**, il faut forcer le rechargement :

```bash
pm2 restart portfolio --update-env
```

---

## 🔐 4. Modifier les variables d'environnement (.env)

```bash
nano /var/www/portfolio/.env
```

Enregistrer dans nano : **`Ctrl+O` → `Entrée` → `Ctrl+X`**

Puis recharger l'app :

```bash
pm2 restart portfolio --update-env
```

> Variables importantes : `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` / `NEXTAUTH_URL` (doivent valoir `https://lionel-dev.site`), `SUPABASE_SERVICE_ROLE_KEY`, `CHARIOW_API_KEY`.

---

## 🌐 5. nginx (reverse proxy)

```bash
nano /etc/nginx/sites-available/portfolio   # Éditer la config
nginx -t                                     # Tester la config (à faire avant de recharger !)
systemctl reload nginx                       # Appliquer les changements sans coupure
systemctl restart nginx                      # Redémarrer complètement nginx
systemctl status nginx                       # Voir l'état de nginx
```

Logs nginx :

```bash
tail -f /var/log/nginx/error.log            # Erreurs en direct
tail -f /var/log/nginx/access.log           # Accès en direct
```

---

## 🔒 6. Certificat SSL (HTTPS)

Le renouvellement est **automatique**. Pour vérifier / forcer :

```bash
certbot certificates            # Voir les certificats et leur date d'expiration
certbot renew --dry-run         # Tester le renouvellement (sans rien changer)
certbot renew                   # Forcer le renouvellement si nécessaire
```

---

## 🗄️ 7. Base de données (Prisma + Supabase)

> La base est sur Supabase (distante). En général **rien à faire sur le VPS**.

```bash
npx prisma studio               # Interface visuelle de la base (attention : ouvre un port local)
npx prisma db push              # Pousser un changement de schéma vers Supabase
npx prisma generate             # Régénérer le client Prisma
```

> ⚠️ Ne PAS lancer `npm run db:seed` en production : le compte admin existe déjà, ça créerait un doublon / une erreur.

---

## 🩺 8. Dépannage courant

### Le site ne répond pas / erreur 502
```bash
pm2 list                        # L'app est-elle "online" ?
pm2 logs portfolio --lines 50   # Regarder les erreurs
curl -I http://localhost:3002   # L'app répond-elle en local ?
systemctl status nginx          # nginx tourne-t-il ?
```

### Le site redirige vers `:3002` dans le navigateur
- D'abord tester en **navigation privée** sur `https://lionel-dev.site/fr` (souvent un cache navigateur).
- Vérifier ce que renvoie l'app :
```bash
curl -sI https://lionel-dev.site/ | grep -iE "^HTTP|^location"
curl -sI -H "Host: lionel-dev.site" http://127.0.0.1:3002/ | grep -iE "^HTTP|^location"
```

### Voir quels ports sont utilisés (pour éviter les conflits)
```bash
pm2 list                        # Rappel : kelenix + portfolio (3002)
ss -tlnp | grep LISTEN          # Tous les ports en écoute
```

### Le build échoue
```bash
node -v                         # Doit être v22.x (Next 16 + drei l'exigent)
nvm use 22                      # Basculer sur Node 22 si besoin
rm -rf .next node_modules       # Nettoyage complet
npm install && npm run build    # Réinstaller et rebuilder
```

---

## 💻 9. Côté local (ta machine Windows) — avant de déployer

```bash
git add -A
git commit -m "description de mes changements"
git push
```

Puis sur le VPS, lancer la commande de déploiement (section 2).

---

## 🧾 Résumé ultra-rapide (déploiement type)

**En local :**
```bash
git add -A && git commit -m "mes changements" && git push
```

**Sur le VPS :**
```bash
cd /var/www/portfolio && git pull && npm install && npm run build && pm2 restart portfolio
```
