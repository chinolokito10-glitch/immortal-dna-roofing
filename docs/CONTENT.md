# Renseigner les preuves de l’entreprise

Le contenu du site est centralisé dans `site.config.js`. Les champs vides produisent des emplacements explicites. Ne remplacez jamais une information manquante par une estimation non vérifiée.

## Identité et contact

- `company.name` : nom commercial réel, identique au nom affiché dans les documents.
- `businessVerified` : `true` seulement après vérification de l’identité.
- `phone` : numéro réel au format international, par exemple `+1…`, sans espaces.
- `phoneDisplay` : présentation lisible du même numéro.
- `email`, `hours` : coordonnées et horaires confirmés.
- `serviceAreas` : villes réellement desservies; `coverageVerified: true` une fois la liste confirmée.
- Aucune ville n’est affichée tant que la couverture n’est pas confirmée.

Quand `phone` est vide, les boutons d’appel expliquent que le numéro manque. Dès qu’il est renseigné, le site génère de vrais liens `tel:` dans l’en-tête, le héros, le contact, le menu mobile et le pied de page.

## Licence, assurance, expérience, garantie

Chaque preuve possède `{ verified: false, value: '', source: '' }`.

Ne passer `verified` à `true` qu’après contrôle de l’information. Renseigner le texte exact et une source publique HTTPS : registre, document public approuvé, conditions de garantie ou présentation documentée de l’entreprise. Sans valeur et URL de source HTTP(S) valide, la preuve reste un emplacement. Ne publier aucun document comportant des renseignements confidentiels.

Les éléments de `differentiators` utilisent le même principe et doivent expliquer les systèmes réellement installés, l’équipe et sa spécialisation, ou la méthode de protection et de nettoyage.

## Services et processus

Chaque service a une description, un périmètre `scope` et un indicateur `verified`. Adapter les descriptions à l’offre réelle avant de confirmer. `title` est une valeur technique stable envoyée par le formulaire; `label` est le titre français. Les options du formulaire sont générées depuis cette même liste. Ajouter un service seulement lorsque son périmètre est connu.

Le processus comporte cinq étapes. Adapter les textes et les documents remis à chaque étape avant de mettre `process.verified` à `true`. Le site distingue actuellement ce déroulement proposé d’une méthode confirmée.

Les réponses FAQ se trouvent dans `faqs`. Remplacer les champs manquants et la réponse de couverture lorsqu’elle est confirmée. Les réponses contenant `[` restent exclues du balisage FAQ structuré.

## Dossiers de chantier

Ajouter les dossiers à `projects`. Format :

```js
{
  id: 'identifiant-du-dossier',
  verified: true, // Seulement après contrôle et autorisation de publication.
  type: 'TYPE RÉEL DE TRAVAUX',
  city: 'VILLE RÉELLE',
  material: 'PRODUIT / SYSTÈME EFFECTIVEMENT INSTALLÉ',
  description: 'Problème observé et périmètre exact des travaux réalisés.',
  completedAt: 'DATE RÉELLE',
  photos: {
    after: {
      src: 'assets/identifiant-apres.webp',
      alt: 'Description factuelle de la toiture du chantier.',
      width: 1200,
      height: 800,
      // srcset facultatif : 'assets/photo-640.webp 640w, assets/photo-1200.webp 1200w'
    },
    // before et during facultatifs, au même format.
  },
}
```

Le site exige un chantier vérifié, un type, une ville, une description et une photo finale avec texte alternatif avant de l’afficher comme réalisation. Le premier dossier alimente le héros et le chantier principal. Le bouton « Voir toutes nos réalisations » développe les autres dossiers. Les étapes photographiées apparaissent directement dans le dossier et peuvent être agrandies. Un matériau non renseigné reste un champ explicite à confirmer; il ne masque pas les photos réelles disponibles.

Avant, travaux et après doivent représenter le même chantier. Ne fournir que les étapes réellement photographiées. Une photo finale seule ne crée pas de faux avant/après. Sans photos, un emplacement explique le manque; les anciennes images architecturales ne sont plus utilisées.

Utiliser des fichiers WebP/AVIF optimisés, sans métadonnées de localisation privées, et des noms simples dans `assets/`. JPG/JPEG/PNG sont aussi servis. Privilégier une largeur de 1200–1600 px pour une image principale et des variantes pour les petits écrans. Fournir les vraies dimensions. `crewPhoto` utilise le même format que les photos de projet.

## Avis clients

`company.reviews` est vide. Pour chaque avis autorisé :

```js
{ verified: true, quote: 'TEXTE ORIGINAL', name: 'NOM AUTORISÉ', city: 'VILLE', rating: 5, source: 'https://LIEN-ORIGINAL' }
```

La note doit correspondre à l’avis original. Le site n’invente ni nom, ni note moyenne, ni extrait. Ne renseigner un avis que lorsqu’il est vérifié. Sans avis, un seul emplacement compact est affiché.

## Vie privée, publication et réception des demandes

Compléter `privacyText` et `legalText` avec les informations approuvées de l’entreprise. Renseigner les réseaux sociaux dans `social` uniquement avec leurs vraies URL.

Définir `PUBLIC_ORIGIN` avec le domaine HTTPS réel. Le site reste non indexable tant que l’identité et la couverture ne sont pas confirmées. Seuls les services vérifiés entrent dans le schéma de l’entreprise. Aucun avis ou chiffre agrégé n’est généré artificiellement.

Configurer `LEAD_WEBHOOK_URL` (HTTPS) et éventuellement `LEAD_WEBHOOK_TOKEN` sur le serveur, jamais dans ce fichier public. Vérifier la réception réelle dans la boîte courriel ou le CRM. Sans destinataire configuré, le formulaire indique que la demande n’est pas envoyée et propose une copie téléchargeable.

Après modification : `npm run build`, puis redémarrer `npm run dev`. Pour une publication statique, déployer `dist/` et prévoir un backend compatible pour les demandes.
