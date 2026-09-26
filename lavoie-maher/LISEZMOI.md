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
| `app.js`, `app.css` | La fenêtre Projecteur interactive (démo avec données fictives, en français et en anglais, calculée dans le navigateur) |
| `_headers`, `.htaccess` | En-têtes de sécurité (Netlify / Cloudflare Pages, ou Apache / cPanel) |
| `.well-known/security.txt` | Contact pour signaler une faille de sécurité |
| `robots.txt` | Autorise l'indexation par les moteurs de recherche |

## Mise en ligne sur votre domaine

1. **Remplacez `VOTRE-DOMAINE.ca`** par votre vrai domaine, ex. `lavoiemaher.ca`, dans `index.html`, `en.html` et `politique-de-confidentialite.html` (commande pour les trouver : `grep -rn VOTRE-DOMAINE .`).
2. **Téléversez tout le contenu de ce dossier** (pas le dossier lui-même, et sans les fichiers `.md`) à la racine de votre site, y compris les fichiers cachés `.htaccess` et `.well-known/` :
   - *Hébergeur classique (cPanel, FTP)* : dans `public_html/`.
   - *Netlify* : glissez le dossier sur app.netlify.com/drop, puis reliez votre domaine dans « Domain settings ».
   - *GitHub Pages* : déconseillé, car il ne permet pas d'ajouter les en-têtes de sécurité.
3. **Activez HTTPS** chez l'hébergeur (certificat Let's Encrypt gratuit, souvent automatique).
4. **Vérifiez l'aperçu de partage** avec l'inspecteur de LinkedIn (linkedin.com/post-inspector).

## Brancher le formulaire de démonstration

Sans configuration, le formulaire affiche un message et n'envoie rien.
Pour recevoir les demandes par courriel :

1. Créez un formulaire chez un service comme Formspree (formspree.io) ; vous obtenez une adresse du type `https://formspree.io/f/abcdwxyz`.
2. Dans `index.html`, collez-la dans `data-endpoint=""` sur la balise `<form class="demo" …>`.

Le site envoie les champs `nom`, `cabinet`, `courriel`, `type` et `message`.

> **Loi 25** : ce service de formulaire recevra des renseignements personnels (nom, courriel).
> Choisissez un fournisseur dont les serveurs et les conditions vous conviennent, mentionnez-le
> dans votre politique de confidentialité, ou pointez `data-endpoint` vers un serveur hébergé au Québec.

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

### Si vous changez de service de formulaire
Dans `_headers` et `.htaccess`, remplacez `https://formspree.io` (directive `connect-src`) par l'adresse de votre service, sinon l'envoi sera bloqué.
