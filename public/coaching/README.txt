Images à déposer dans ce dossier (public/coaching/)
====================================================

1. cover.jpg   -> La couverture du livre/affiche
                  « Coaching : Lance ton site web avec l'IA en 2 semaines »
                  (format portrait, celle avec le laptop + montagne)
                  Utilisée en grand dans la section Hero + image de partage (OpenGraph).

2. coach.jpg   -> Ta photo (l'homme en costume bleu)
                  Affichée en rond dans la section « Pour qui ? ».

Formats acceptés : .jpg, .jpeg, .png, .webp
Si tu changes l'extension, mets à jour les chemins dans :
  src/components/sections/CoachingLanding.tsx   (src="/coaching/cover.jpg" et "/coaching/coach.jpg")
  src/app/[locale]/coaching/page.tsx            (openGraph images)
