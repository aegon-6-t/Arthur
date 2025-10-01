/**
 * Script pour corriger le mot de passe de l'admin
 */

const User = require('./models/User');

async function fixAdminPassword() {
    try {
        console.log('🔐 Correction du mot de passe admin...');
        
        // Récupération de l'admin
        const admin = await User.findByEmail('admin@planning.com');
        if (!admin) {
            console.log('❌ Admin non trouvé');
            return;
        }
        
        console.log('📋 Admin trouvé:', {
            id: admin.id,
            email: admin.email,
            role: admin.role
        });
        
        // Mise à jour du mot de passe
        await User.update(admin.id, {
            mot_de_passe: 'Admin123!'
        });
        
        console.log('✅ Mot de passe admin mis à jour !');
        
        // Test de la connexion
        console.log('🧪 Test de la connexion...');
        const testUser = await User.findByEmail('admin@planning.com');
        const isPasswordValid = await User.verifyPassword('Admin123!', testUser.mot_de_passe);
        
        if (isPasswordValid) {
            console.log('✅ Mot de passe vérifié avec succès !');
        } else {
            console.log('❌ Problème avec le mot de passe');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Exécution
fixAdminPassword().then(() => {
    console.log('🎉 Script terminé !');
    process.exit(0);
}).catch(console.error);
