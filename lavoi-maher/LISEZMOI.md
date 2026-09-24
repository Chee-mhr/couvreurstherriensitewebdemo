# Site Lavoi&Maher, inc.

Site statique d'une page : aucun serveur, aucune base de données, aucune dépendance externe.
Il fonctionne sur n'importe quel hébergeur web.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | La page (HTML, CSS et JavaScript intégrés) |
| `fonts.css` + `fonts/` | Polices auto-hébergées (aucun appel à Google) |
| `favicon.svg`, `apple-touch-icon.png` | Icônes d'onglet et d'écran d'accueil |
| `og-image.png` | Aperçu affiché quand le lien est partagé (LinkedIn, Facebook, Teams, courriel) |
| `robots.txt` | Autorise l'indexation par les moteurs de recherche |

## Mise en ligne sur votre domaine

1. **Remplacez `VOTRE-DOMAINE.ca`** dans `index.html` (5 occurrences, dans l'en-tête) par votre vrai domaine, ex. `lavoimaher.ca`.
2. **Téléversez tout le contenu de ce dossier** (pas le dossier lui-même) à la racine de votre site :
   - *Hébergeur classique (cPanel, FTP)* : dans `public_html/`.
   - *Netlify* : glissez le dossier sur app.netlify.com/drop, puis reliez votre domaine dans « Domain settings ».
   - *GitHub Pages* : Settings → Pages, puis ajoutez votre domaine dans « Custom domain ».
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
- **Politique de confidentialité** : la Loi 25 exige qu'elle soit publiée sur votre site dès que vous
  recueillez des renseignements personnels (le formulaire en recueille). Ajoutez une page et un lien au pied de page.
- **Données d'exemple** : les pièces, noms, montants et durées de la démo sont fictifs et annoncés comme tels.
