import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: "Conditions Générales d'Utilisation | Marketplace",
  description: "Conditions générales d'utilisation de notre marketplace de services.",
};

export default function CGUPage() {
  return (
    <main>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-500 mb-12">Dernière mise à jour : 27 mars 2026</p>

        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Présentation de la plateforme</h2>
            <p className="text-gray-700 leading-relaxed">
              La présente plateforme (ci-après "le Marketplace") est un service de mise en relation entre des prestataires
              de services indépendants (ci-après "Vendeurs") et des particuliers ou professionnels souhaitant acquérir ces
              services (ci-après "Acheteurs"). L'utilisation du Marketplace implique l'acceptation pleine et entière des
              présentes Conditions Générales d'Utilisation (CGU).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Accès et inscription</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              L'accès au Marketplace est libre. Toutefois, la création d'un compte est obligatoire pour passer une commande
              ou proposer des services. Pour créer un compte, vous devez :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Être une personne physique majeure ou une personne morale régulièrement immatriculée ;</li>
              <li>Fournir des informations exactes, complètes et à jour ;</li>
              <li>Accepter les présentes CGU et notre Politique de Confidentialité ;</li>
              <li>Ne pas créer de compte au nom d'une tierce personne sans son autorisation explicite.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Vous êtes seul responsable de la confidentialité de vos identifiants de connexion. Toute utilisation du
              Marketplace depuis votre compte est présumée être effectuée par vous.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Services proposés</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Les Vendeurs proposent des services définis dans leurs annonces. Chaque annonce doit :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Décrire avec précision et honnêteté le service proposé ;</li>
              <li>Indiquer un prix clair, exprimé en euros ou en dollars selon la configuration du compte ;</li>
              <li>Ne pas contenir de contenu illicite, trompeur ou contraire aux bonnes mœurs ;</li>
              <li>Respecter toutes les réglementations applicables à la prestation concernée.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Le Marketplace se réserve le droit de supprimer toute annonce ne respectant pas ces critères, sans préavis
              ni indemnisation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Commandes et paiement</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Lorsqu'un Acheteur passe une commande, il accepte de payer le montant indiqué dans l'annonce. Le paiement
              est traité de manière sécurisée via notre prestataire Stripe. Aucune information bancaire n'est stockée sur
              nos serveurs.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Le Marketplace prélève une commission sur chaque transaction conclue entre un Vendeur et un Acheteur. Le
              taux de commission est communiqué dans l'espace Vendeur lors de l'inscription.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Les fonds sont reversés au Vendeur après livraison confirmée et expiration du délai de réclamation, selon
              les modalités définies dans les conditions de paiement Stripe Connect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Annulation et remboursement</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Une commande peut être annulée par l'Acheteur avant que le Vendeur n'ait commencé à la traiter. Dans ce
              cas, un remboursement intégral est effectué sous 5 à 10 jours ouvrés.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              En cas de litige relatif à la qualité d'un service livré, l'Acheteur dispose d'un délai de 7 jours après
              la livraison pour ouvrir une réclamation via le centre de résolution du Marketplace. Nos équipes analyseront
              la situation et pourront décider d'un remboursement partiel ou total selon le bien-fondé de la réclamation.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Aucun remboursement ne sera accordé pour les services livrés conformément à l'annonce et aux échanges entre
              les parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Responsabilités</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Le Marketplace agit en tant qu'intermédiaire technique et ne saurait être tenu responsable de la qualité,
              de la légalité ou de la pertinence des services proposés par les Vendeurs.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Chaque Vendeur est seul responsable du contenu de ses annonces, de la bonne exécution des services commandés
              et du respect de ses obligations fiscales et sociales en lien avec son activité de prestation de services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              L'ensemble des éléments constituant le Marketplace (logo, design, textes, fonctionnalités) sont protégés
              par les droits de propriété intellectuelle et appartiennent à l'éditeur de la plateforme. Toute reproduction,
              diffusion ou utilisation sans autorisation préalable est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Comportements interdits</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Il est interdit de :</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Contourner les systèmes de paiement du Marketplace en traitant les transactions en dehors de la plateforme ;</li>
              <li>Usurper l'identité d'une autre personne ou entité ;</li>
              <li>Publier des avis frauduleux ou manipuler le système de notation ;</li>
              <li>Utiliser des bots, scrapers ou tout outil automatisé sans autorisation ;</li>
              <li>Proposer ou commander des services illégaux ou contraires à l'ordre public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Suspension et résiliation</h2>
            <p className="text-gray-700 leading-relaxed">
              Le Marketplace se réserve le droit de suspendre ou de clôturer tout compte en cas de violation des
              présentes CGU, de comportement frauduleux ou de mise en danger d'autres utilisateurs. En cas de résiliation,
              les commandes en cours seront gérées au cas par cas afin de protéger les droits de toutes les parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Modifications des CGU</h2>
            <p className="text-gray-700 leading-relaxed">
              Le Marketplace se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
              informés des changements substantiels par e-mail ou notification sur la plateforme. La poursuite de
              l'utilisation du Marketplace après notification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Droit applicable et juridiction</h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de résolution
              amiable, les tribunaux compétents seront ceux du ressort du siège social de l'éditeur du Marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante :{' '}
              <a href="mailto:legal@marketplace.fr" className="underline hover:text-black">
                legal@marketplace.fr
              </a>
            </p>
          </section>

        </div>
      </div>

      {/* Footer légal */}
      <footer className="border-t border-gray-100 mt-16 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 Marketplace. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="/cgu" className="hover:text-black">CGU</a>
            <a href="/privacy" className="hover:text-black">Confidentialité</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
