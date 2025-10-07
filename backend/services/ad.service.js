const ldap = require('ldapjs');
const config = require('../config/ad.config');

function createClient() {
  return ldap.createClient({ url: config.url });
}

exports.createUser = async ({ prenom, nom, email, mot_de_passe }) => {
  return new Promise((resolve, reject) => {
    const client = createClient();

    client.bind(config.username, config.password, (err) => {
      if (err) return reject(new Error(`Erreur connexion AD: ${err.message}`));

      const cn = `${prenom} ${nom}`;
      const dn = `CN=${cn},${config.baseDN}`;
      const entry = {
        cn,
        sn: nom,
        givenName: prenom,
        displayName: cn,
        objectClass: ['top', 'person', 'organizationalPerson', 'user'],
        userAccountControl: 512,
        sAMAccountName: email.split('@')[0],
        userPrincipalName: email,
      };

      client.add(dn, entry, (err) => {
        if (err) {
          client.unbind();
          return reject(new Error(`Erreur création user: ${err.message}`));
        }

        // Activation du compte
        const activate = new ldap.Change({
          operation: 'replace',
          modification: { userAccountControl: '512' },
        });

        client.modify(dn, activate, (err) => {
          if (err) {
            client.unbind();
            return reject(new Error(`Erreur activation: ${err.message}`));
          }

          if (config.url.startsWith('ldaps://')) {
            const pwd = `"${mot_de_passe}"`;
            const utf16Pwd = Buffer.from(pwd, 'utf16le');
            const change = new ldap.Change({
              operation: 'replace',
              modification: { unicodePwd: utf16Pwd },
            });

            client.modify(dn, change, (err) => {
              client.unbind();
              if (err) reject(new Error(`Erreur mot de passe: ${err.message}`));
              else resolve(`Utilisateur ${cn} créé avec succès`);
            });
          } else {
            client.unbind();
            resolve(`Utilisateur ${cn} créé (sans mot de passe, LDAP non sécurisé)`);
          }
        });
      });
    });
  });
};
