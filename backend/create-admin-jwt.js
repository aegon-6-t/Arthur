/**
 * Script pour créer un utilisateur admin avec JWT
 */

const User = require('./models/User');

async function createAdminUser() {
    try {
        console.log('🔐 Création de l\'utilisateur admin...');
        
        // Vérification si l'admin existe déjà
        const existingAdmin = await User.findByEmail('admin@planning.com');
        if (existingAdmin) {
            console.log('✅ Utilisateur admin existe déjà');
            console.log('📋 Admin:', {
                id: existingAdmin.id,
                nom: existingAdmin.nom,
                prenom: existingAdmin.prenom,
                email: existingAdmin.email,
                role: existingAdmin.role
            });
            return;
        }
        
        // Création de l'utilisateur admin
        const adminUser = await User.create({
            nom: 'Admin',
            prenom: 'Système',
            email: 'admin@planning.com',
            mot_de_passe: 'Admin123!',
            role: 'admin'
        });
        
        console.log('✅ Utilisateur admin créé avec succès !');
        console.log('📋 Admin:', {
            id: adminUser.id,
            nom: adminUser.nom,
            prenom: adminUser.prenom,
            email: adminUser.email,
            role: adminUser.role
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error);
    }
}

// Exécution
createAdminUser().then(() => {
    console.log('🎉 Script terminé !');
    process.exit(0);
}).catch(console.error);
