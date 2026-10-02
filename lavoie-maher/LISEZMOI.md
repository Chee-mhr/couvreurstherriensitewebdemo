# Site Lavoie&Maher, inc.

Site statique d'une page : aucun serveur, aucune base de données, aucune dépendance externe.
Il fonctionne sur n'importe quel hébergeur web.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | La page en français (HTML, CSS et JavaScript intégrés) |
| `en.html` | La page en anglais (bouton FR/EN en haut à droite) |
| `fonts.css` + `fonts/` | Polices auto-hébergées (aucun appel à Google) |
| `favicon.svg`, `apple-touch-icon.png` | Icônes d'onglet et d'écran d'accueil |
| `og-image.png` | Aperçu affiché quand le lien est partagé (LinkedIn, Facebook, Teams, courriel) |
| `politique-de-confidentialite.html` | Politique de confidentialité (Loi 25) |
| `site-fr.js`, `site-en.js`, `politique.js` | Le code des animations et du formulaire (séparé du HTML pour la sécurité) |
| `envoyer.php` | Envoi des demandes du formulaire à contact@lavoiemaher.ca (serveur WHC) |
| `app.js`, `app.css` | La fenêtre Projecteur interactive (démo avec données fictives, en français et en anglais, calculée dans le navigateur) |
| `logo/` | Le logo : `symbole.svg` (sceau gravé, 64 px et plus), `symbole-simple.svg` (anneau et L&M, 24 à 64 px), `icone-lm.svg` (L M seuls, sous 32 px et favicon), `logo-horizontal.svg` / `logo-horizontal-clair.svg` (sceau et nom), versions d'impression `symbole-clair.svg`, `symbole-or-plat.svg`, `symbole-noir.svg`, `symbole-blanc.svg`, et `icone-512.png` (réseaux sociaux) |
| `_headers`, `.htaccess` | En-têtes de sécurité (Netlify / Cloudflare Pages, ou Apache / cPanel) |
| `.well-known/security.txt` | Contact pour signaler une faille de sécurité |
| `robots.txt`, `sitemap.xml` | Indexation par les moteurs de recherche, plan du site |
| `_redirects` | Redirections vers https://lavoiemaher.ca (Netlify) |

## Mise en ligne : lavoiemaher.ca (principal) et lavoiemaher.com

Le site est configuré pour **https://lavoiemaher.ca** (adresses canoniques, image de partage, plan du site).
`lavoiemaher.com`, les adresses en `www` et `http://` redirigent toutes vers `https://lavoiemaher.ca` (redirection 301), dans `.htaccess` (Apache, cPanel) et `_redirects` (Netlify).

1. **Téléversez tout le contenu de ce dossier** (pas le dossier lui-même, et sans les fichiers `.md`) à la racine du site, y compris les fichiers cachés `.htaccess` et `.well-known/` :
   - *Hébergeur classique (cPanel, FTP)* : dans `public_html/`. Ajoutez `lavoiemaher.com` comme « domaine parqué » ou « alias » du même site.
   - *Netlify* : glissez le dossier sur app.netlify.com/drop, puis dans « Domain management » ajoutez `lavoiemaher.ca` comme domaine principal et `lavoiemaher.com` comme alias.
   - *Cloudflare Pages* : le fichier `_redirects` ne gère pas les autres domaines ; créez une règle « Bulk Redirect » de `lavoiemaher.com` et des `www` vers `https://lavoiemaher.ca`.
2. **Chez le registraire des deux domaines**, entrez les réglages DNS fournis par l'hébergeur (serveurs de noms, ou enregistrements A pour `@` et CNAME pour `www`), pour `.ca` **et** `.com`. Délai : de quelques minutes à 48 heures.
3. **Activez HTTPS** pour les quatre adresses (`lavoiemaher.ca`, `www.lavoiemaher.ca`, `lavoiemaher.com`, `www.lavoiemaher.com`) avant tout : le site exige HTTPS (HSTS) dès la première visite.
4. **Courriels** : créez `confidentialite@lavoiemaher.ca` (responsable de la protection des renseignements personnels, exigé par la Loi 25) et `securite@lavoiemaher.ca` (indiquée dans `.well-known/security.txt`), puis ajoutez les réglages SPF, DKIM et DMARC donnés par votre service de courriel.
5. **Protégez les domaines** : renouvellement automatique, verrou de transfert, double authentification au registraire, DNSSEC si offert.
6. **Vérifiez** : `http://lavoiemaher.com` doit arriver sur `https://lavoiemaher.ca` ; securityheaders.com doit donner A ou A+ ; l'inspecteur LinkedIn (linkedin.com/post-inspector) doit afficher le logo et l'image de partage. Soumettez `https://lavoiemaher.ca/sitemap.xml` dans Google Search Console.

## Le formulaire de démonstration

Le formulaire envoie chaque demande par courriel à `contact@lavoiemaher.ca`, depuis le serveur WHC (`envoyer.php`) : aucune donnée ne passe par un service étranger.
Le courriel arrive avec le nom, le cabinet, le courriel, le type de dossiers et le volume ; « Répondre » écrit directement au demandeur.
Protections : pot de miel contre les robots, même origine seulement, 5 envois au plus par 10 minutes par adresse IP, champs nettoyés (aucune injection d'en-têtes).
Pour changer le destinataire : modifier `DEST` au début de `envoyer.php`.

## Avant la mise en ligne : à valider

- **Allégations** : « zéro hallucination », « 100 % local », « Loi 25 », chiffrement, journal d'audit.
  Faites-les confirmer par votre équipe technique et, idéalement, par un avocat (publicité trompeuse, LPC).
- **Politique de confidentialité** : complétez chaque passage marqué `À COMPLÉTER` dans
  `politique-de-confidentialite.html` (responsable, dates, fournisseurs, durées), retirez l'encadré
  « Note interne », puis faites valider le texte. Le courriel du responsable est aussi à compléter
  au pied de page de `index.html` (la Loi 25 exige qu'il soit publié sur le site).
- **Données d'exemple** : les pièces, noms, montants et durées de la démo sont fictifs et annoncés comme tels.

## Sécurité

### Ce qui est déjà en place dans le code
- **Aucun point d'entrée serveur** : site statique, sans base de données, sans compte, sans témoin (cookie), sans ressource externe.
- **Politique de sécurité du contenu (CSP) stricte** : seul le code du site peut s'exécuter; tout script injecté est bloqué. Testée : aucune violation.
- **En-têtes de sécurité** (`_headers` ou `.htaccess`) : HTTPS obligatoire (HSTS), interdiction d'afficher le site dans un cadre d'un autre site, blocage caméra/micro/position, pas de fuite d'adresse vers les autres sites.
- **Formulaire** : longueurs maximales, champ piège contre les robots (pot de miel), délai de 30 secondes entre deux envois, texte saisi jamais interprété comme du code.
- **`.htaccess`** : pas de liste des fichiers du serveur, fichiers `.md` inaccessibles.
- **`security.txt`** : adresse où signaler une faille (à compléter).

### Ce que vous devez activer vous-même (vos comptes)
1. **Authentification à deux facteurs (2FA)** sur : l'hébergeur, le registraire du nom de domaine, GitHub, la boîte courriel qui reçoit les demandes, le service de formulaire. Utilisez une application (Google Authenticator, 1Password, Authy) plutôt que le texto.
2. **Verrou de transfert du domaine** (« registrar lock ») et **DNSSEC** chez le registraire, si offert.
3. **Mots de passe uniques** et gestionnaire de mots de passe; accès **SFTP** seulement (jamais FTP simple); un compte par personne, retirer les accès des anciens collaborateurs.
4. **Service de formulaire** : activer son filtre anti-pourriel et limiter l'adresse d'envoi à votre domaine.

### Surveillance (vos « détecteurs de mouvement »)
- **Surveillance de disponibilité** gratuite (ex. UptimeRobot) : alerte courriel si le site tombe ou change.
- **Alertes GitHub** : activer la détection de secrets et les alertes de sécurité du dépôt.
- **Vérification des en-têtes** après la mise en ligne : securityheaders.com et observatory.mozilla.org (visez A ou A+).
- **Registre des incidents** (exigé par la Loi 25) : noter tout accès non autorisé et, en cas de risque de préjudice sérieux, aviser la Commission d'accès à l'information.

### Formulaire
Le formulaire passe par `envoyer.php` sur le même serveur : la règle `connect-src 'self'` suffit. Si un service externe était un jour utilisé, ajouter son adresse à `connect-src` dans `_headers` et `.htaccess`.


## Le logo

Un **sceau gravé** : « LAVOIE & MAHER » et « QUÉBEC » en capitales Bodoni autour de l'anneau, comme un sceau de notaire, et au centre une **balance de la justice** : le L et le M en italique dans les plateaux, l'esperluette ivoire sur le montant. Lettres tirées de la Bodoni Moda du site (licence OFL).

- Sous 64 px, utiliser `symbole-simple.svg` (le texte gravé ne se lit plus) ; sous 32 px, `icone-lm.svg`.
- Impression : `symbole-or-plat.svg` (or sans dégradé, ex. dorure à chaud), `symbole-noir.svg` (une couleur), `symbole-blanc.svg` (sur fond foncé ou photo).
- Laisser autour du symbole un espace libre égal au quart de son diamètre. Ne pas déformer, recolorer ni ajouter d'ombre.
