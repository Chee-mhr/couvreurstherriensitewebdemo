# Plan pour la session locale : finaliser et mettre en ligne Lavoie&Maher

Site : dossier `lavoie-maher/` de la branche `claude/determined-mendel-or8lrt`
(dépôt `chee-mhr/couvreurstherriensitewebdemo`). Le `index.html` à la racine du dépôt
est un autre site (Couvreurs Therrien) : ne pas y toucher.

Règle générale : **ne rien deviner**. Toute information sur l'entreprise ou l'outil
est demandée à l'utilisateur. Garder le style existant (tokens CSS dans `:root`).

---

## Étape 1 — Récupérer et afficher le site

```
git fetch origin claude/determined-mendel-or8lrt
git checkout claude/determined-mendel-or8lrt
```

Lire `lavoie-maher/LISEZMOI.md`, puis ouvrir `lavoie-maher/index.html` dans le navigateur.

## Étape 2 — Contenu : ne rien ajouter

Le contenu du site décrit exactement ce que fait le produit (texte fourni par l'entreprise) :
faire entrer un dossier (formats, OCR Qwen3-VL, Whisper, inventaire, estimation),
classement en quatre modes réversible, `question` / `mentions` / `partout` / `chronologie`,
résumés de documents (points clés ou paragraphe, chaque point renvoie à sa source),
index des pages liminaires, les quatre assemblages, `temoins` et `credibilite`,
calcul d'échéance en droit du travail, plus la carte « Français et anglais » gardée à la demande.

Ne réintroduire aucune fonction absente de cette liste (notamment : détection de
contradictions, caviardage, repérage de renseignements personnels, surlignage).
Les exemples des démos sont fictifs et anonymisés (témoins A à G, dossiers A à C).

Toute modification de contenu faite dans `index.html` doit aussi être faite dans `en.html` (version anglaise).

## Étape 3 — Compléter les informations manquantes

Trouver tous les passages : `grep -rn "À COMPLÉTER" lavoie-maher/`

Demander à l'utilisateur :

- nom, courriel et adresse du **responsable de la protection des renseignements personnels** ;
- **dates** d'entrée en vigueur et de mise à jour de la politique ;
- **hébergeur** du site, **service de formulaire**, **service de courriel**, et le lieu
  d'hébergement de chacun (recommander des options au Québec ou au Canada, cohérentes
  avec l'argument principal : la Loi 25) ;
- **durées de conservation** : demandes du formulaire (suggestion 24 mois) et journaux
  de l'hébergeur (suggestion 30 jours) ;
- si l'équipe peut **accéder à l'installation d'un client** (soutien technique), et à
  quelles conditions.

Puis retirer l'encadré « Note interne » (`<p class="todo-note">…</p>`) de
`politique-de-confidentialite.html` et vérifier qu'il ne reste aucun « À COMPLÉTER ».

## Étape 4 — Domaine et formulaire

- Demander le nom de domaine ; remplacer `VOTRE-DOMAINE.ca` partout
  (dans `index.html`, `en.html` et `politique-de-confidentialite.html` ; `grep -rn VOTRE-DOMAINE lavoie-maher/`).
- Si l'utilisateur a une adresse de service de formulaire (ex. Formspree), la coller dans
  `data-endpoint=""` sur `<form class="demo" …>` dans `index.html`. Sinon, le formulaire
  reste en mode démonstration (aucun envoi).

## Étape 5 — Vérifier

- Ouvrir les deux pages sur ordinateur et en largeur mobile (~390 px) : pas de
  défilement horizontal, menu mobile fonctionnel, aucune erreur dans la console.
- Vérifier qu'aucune requête ne part vers un site externe (onglet Réseau).
- `grep -rn "À COMPLÉTER\|TO COMPLETE\|VOTRE-DOMAINE" lavoie-maher/` ne doit rien retourner (le courriel du responsable apparaît aussi au pied de `en.html`).

## Étape 6 — Enregistrer

Commit clair en français, puis `git push origin claude/determined-mendel-or8lrt`.

## Étape 7 — Mettre en ligne (guider l'utilisateur pas à pas)

Téléverser **le contenu** de `lavoie-maher/` (pas le dossier lui-même) à la racine du site,
sauf `LISEZMOI.md` et `PLAN-SESSION-LOCALE.md` (et en incluant `.htaccess` et `.well-known/`) :

- *cPanel / FTP* : dans `public_html/` ;
- *Netlify* : glisser le dossier sur app.netlify.com/drop, puis relier le domaine ;
- *GitHub Pages* : Settings → Pages, puis « Custom domain ».

Ensuite : activer HTTPS, vérifier l'aperçu de partage (linkedin.com/post-inspector), puis tester les en-têtes sur securityheaders.com (viser A ou A+).
Suivre la section « Sécurité » de `LISEZMOI.md` avec l'utilisateur : 2FA sur tous ses comptes, verrou du domaine, surveillance de disponibilité.
Ne pas oublier les fichiers cachés `.htaccess` et `.well-known/`. Si le service de formulaire n'est pas Formspree, adapter `connect-src` dans `_headers` et `.htaccess`.

## Rappel à faire une fois (conformité avant la mise en ligne)

- Les allégations « zéro hallucination » et « respect de la Loi 25 » doivent être validées
  par un avocat (Loi sur la protection du consommateur, art. 219 ; Loi sur la concurrence,
  art. 74.01 : une allégation de performance doit reposer sur des tests faits *avant* de la publier).
- Conserver les preuves des chiffres affichés (7 ms, 0,1 s, 45 volumes, 17 témoins, banc d'essai
  Qwen3-VL contre PaddleOCR) : le pied de page dit qu'ils viennent de tests internes.
- Loi 25 pour le site lui-même : publier la politique complète et le courriel du responsable
  (art. 3.2 et 8.2). Si le service de formulaire est hors Québec (Formspree : États-Unis),
  faire l'évaluation des facteurs relatifs à la vie privée avant (art. 17), ou choisir un service au Canada.
- Vérifier que la raison sociale « Lavoie&Maher, inc. » est bien celle immatriculée au Registraire des entreprises.
- Les polices sont sous licence OFL 1.1 : garder `fonts/OFL.txt` avec les fichiers.
