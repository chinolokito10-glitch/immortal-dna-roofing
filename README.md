# Immortal DNA — Roofing Website

A black, white, and red colorway of the Toiture Démo roofing template. The original layout, typography, responsive behavior, content, and interactions are preserved. Theme tokens are defined at the top of `styles.css`.

Refonte française centrée sur les dossiers de chantier et les informations vérifiables. Toiture Démo est un modèle personnalisable à présenter aux propriétaires d’entreprises de toiture. Aucun numéro, chantier, avis, matériau ou titre professionnel n’est inventé.

## Localhost

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000. Après modification de `site.config.js`, redémarrer le serveur. Il génère le HTML à partir des données; le build statique utilise le même rendu.

## Renseigner l’entreprise

Le contenu se trouve dans **`site.config.js`**. Guide complet : **[docs/CONTENT.md](docs/CONTENT.md)**.

Les photos architecturales générées précédemment restent dans les fichiers existants mais ne sont plus affichées ni chargées par le site. Les preuves non fournies sont signalées. Le téléphone absent ouvre une explication; un vrai numéro active les liens d’appel. Les réalisations vérifiées alimentent le héros et le portfolio, avec uniquement les étapes réellement photographiées.

## Structure

En-tête → héros concret → licence / assurance / expérience / garantie → services → dossiers de chantier → processus en cinq étapes → particularités documentées → avis sourcés → secteurs → FAQ → contact → pied de page.

Le site conserve le menu mobile accessible, les accordéons, les liens internes, les états de focus, le mouvement réduit et le formulaire validé. La barre mobile comporte appel et soumission. Aucun framework frontend ni service de suivi.

## Build et vérification

```sh
npm run build
npm test
npm run test:browser
```

`dist/` contient le site statique. Les tests vérifient le backend, la séparation entre données manquantes et preuves confirmées, le téléphone, le rendu de dossiers réels, le SEO, cinq tailles d’écran, l’accessibilité et le téléchargement d’une demande non envoyée.

## Vercel

`vercel.json` builds the site with `npm run build` and serves `dist/` as static files.
The `/api/config` route serves the static form configuration. On Vercel, requests
remain downloadable demo requests; delivery requires the separately configured
Node server described below.

## Réception des demandes (serveur Node)

Variables serveur, décrites dans `.env.example` :

- `LEAD_WEBHOOK_URL` : destinataire HTTPS qui accepte le JSON.
- `LEAD_WEBHOOK_TOKEN` : jeton facultatif, serveur uniquement.
- `PUBLIC_ORIGIN` : domaine public HTTPS réel.
- `PORT` : 3000 par défaut.

Exemple de démarrage avec variables privées : `node --env-file=.env server.js`.

L’interface ne confirme l’envoi qu’après acceptation du destinataire. Sans configuration, elle propose une copie téléchargeable et ne simule aucun envoi. Le serveur protège les fichiers privés par une liste explicite des fichiers publics autorisés.

## SEO

Métadonnées, canonical, Open Graph, sitemap et balisage WebPage/FAQ sont conservés. Le schéma RoofingContractor et les services sont limités aux informations confirmées. Les FAQ avec champs manquants sont exclues du schéma. L’image Open Graph provient du premier chantier réel renseigné. Sans identité et couverture vérifiées, l’aperçu reste `noindex`, même si un domaine est configuré.

Pour un hébergement statique, définir `PUBLIC_ORIGIN` au build. Pour Node en production, définir les variables sur l’hôte et utiliser HTTPS via la plateforme d’hébergement.
