import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Politique de Confidentialité | Marketplace',
  description: 'Politique de confidentialité et protection des données personnelles de notre marketplace.',
};

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">Politique de Confidentialité</h1>
        <p className="text-gray-500 mb-12">Dernière mise à jour : 27 mars 2026</p>

        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Responsable du traitement</h2>
            <p className="text-gray-700 leading-relaxed">
              Le responsable du traitement de vos données personnelles est l'éditeur du Marketplace, accessible à
              l'adresse{' '}
              <a href="mailto:privacy@marketplace.fr" className="underline hover:text-black">
                privacy@marketplace.fr
              </a>
              . Nous nous engageons à protéger votre vie privée conformément au Règlement Général sur la Protection des
              Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nous collectons les données suivantes lors de votre utilisation du Marketplace :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>
                <strong>Données d'identité :</strong> nom, prénom, adresse e-mail, photo de profil (optionnelle) ;
              </li>
              <li>
                <strong>Données de compte :</strong> identifiants de connexion (mot de passe stocké sous forme hachée) ;
              </li>
              <li>
                <strong>Données de transaction :</strong> historique des commandes, montants, statuts de paiement ;
              </li>
              <li>
                <strong>Données de communication :</strong> messages échangés avec d'autres utilisateurs via la messagerie
                interne ;
              </li>
              <li>
                <strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, horodatages ;
              </li>
              <li>
                <strong>Données de paiement :</strong> traitées directement par Stripe — nous ne stockons aucune
                information bancaire sur nos serveurs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Finalités du traitement</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vos données sont utilisées pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Création et gestion de votre compte utilisateur ;</li>
              <li>Mise en relation entre Acheteurs et Vendeurs ;</li>
              <li>Traitement des commandes et des paiements ;</li>
              <li>Envoi de notifications relatives à votre activité sur la plateforme ;</li>
              <li>Prévention de la fraude et sécurité de la plateforme ;</li>
              <li>Respect de nos obligations légales et réglementaires ;</li>
              <li>Amélioration de l'expérience utilisateur et analyse statistique (données agrégées et anonymisées).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Base légale du traitement</h2>
            <p className="text-gray-700 leading-relaxed">
              Les traitements réalisés reposent sur les bases légales suivantes : l'exécution du contrat (gestion des
              commandes, de votre compte), le respect des obligations légales (comptabilité, lutte anti-fraude), et notre
              intérêt légitime (amélioration du service, sécurité). Lorsque requis, nous obtenons votre consentement
              préalable (par exemple pour l'envoi de communications marketing).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>
                <strong>Stripe</strong> — prestataire de paiement, pour le traitement sécurisé des transactions ;
              </li>
              <li>
                <strong>Hébergeur</strong> — pour le stockage des données sur des serveurs sécurisés localisés dans l'UE ;
              </li>
              <li>
                <strong>Autorités publiques</strong> — sur demande légale et dans les limites prévues par la loi.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Durée de conservation</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données sont conservées le temps nécessaire à la réalisation des finalités décrites ci-dessus, et au
              minimum :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mt-2">
              <li>Données de compte actif : pendant toute la durée de votre inscription ;</li>
              <li>Données de transactions : 10 ans à compter de la transaction (obligation comptable) ;</li>
              <li>Données de navigation : 13 mois maximum ;</li>
              <li>Données après clôture du compte : 3 ans à des fins probatoires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Vos droits</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données ;</li>
              <li><strong>Droit de rectification :</strong> corriger des informations inexactes ;</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données ;</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré ;</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements ;</li>
              <li><strong>Droit à la limitation :</strong> demander la restriction du traitement.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:privacy@marketplace.fr" className="underline hover:text-black">
                privacy@marketplace.fr
              </a>
              . Nous nous engageons à répondre dans un délai d'un mois. Vous pouvez également introduire une réclamation
              auprès de la CNIL (
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                www.cnil.fr
              </a>
              ).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Sécurité des données</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
              contre tout accès non autorisé, perte ou divulgation. Les mots de passe sont chiffrés (hachage bcrypt),
              les communications transitent via HTTPS et l'accès aux données est strictement limité aux personnes
              habilitées. En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et
              libertés, vous serez notifié dans les délais légaux.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Le Marketplace utilise des cookies strictement nécessaires au fonctionnement de l'authentification et de
              la session utilisateur. Aucun cookie publicitaire ou de tracking tiers n'est déposé sans votre consentement
              explicite. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut altérer le bon
              fonctionnement de certaines fonctionnalités.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Transferts hors UE</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données sont stockées et traitées au sein de l'Union européenne. Dans les cas où un transfert hors UE
              serait nécessaire (notamment via certains outils tiers), nous nous assurons que ce transfert est encadré par
              des garanties appropriées (clauses contractuelles types, certification Privacy Shield ou équivalent).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Modifications de la politique</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de mettre à jour cette politique à tout moment. Toute modification substantielle
              vous sera notifiée par e-mail ou via la plateforme. La date de dernière mise à jour est indiquée en tête de
              ce document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question relative à la présente politique ou à vos données personnelles, contactez notre délégué
              à la protection des données (DPO) :{' '}
              <a href="mailto:privacy@marketplace.fr" className="underline hover:text-black">
                privacy@marketplace.fr
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
