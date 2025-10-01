/**
 * Script de test pour l'authentification JWT
 * Teste la connexion et l'utilisation des tokens JWT
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Fonction pour tester la connexion
async function testLogin() {
    try {
        console.log('🔐 Test de connexion avec JWT...');
        
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@planning.com',
            mot_de_passe: 'Admin123!'
        });

        console.log('✅ Connexion réussie !');
        console.log('📋 Réponse:', JSON.stringify(response.data, null, 2));
        
        return response.data.token;
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.response?.data || error.message);
        return null;
    }
}

// Fonction pour tester la vérification du token
async function testVerifyToken(token) {
    try {
        console.log('\n🔍 Test de vérification du token...');
        
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Token valide !');
        console.log('📋 Réponse:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Erreur de vérification:', error.response?.data || error.message);
    }
}

// Fonction pour tester l'accès au planning
async function testPlanningAccess(token) {
    try {
        console.log('\n📅 Test d\'accès au planning...');
        
        const response = await axios.get(`${BASE_URL}/planning`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Accès au planning réussi !');
        console.log('📋 Réponse:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Erreur d\'accès au planning:', error.response?.data || error.message);
    }
}

// Fonction pour tester l'inscription d'un nouvel utilisateur
async function testRegister() {
    try {
        console.log('\n👤 Test d\'inscription...');
        
        const response = await axios.post(`${BASE_URL}/auth/register`, {
            nom: 'Test',
            prenom: 'JWT',
            email: 'test.jwt@example.com',
            mot_de_passe: 'TestJWT123!'
        });

        console.log('✅ Inscription réussie !');
        console.log('📋 Réponse:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Erreur d\'inscription:', error.response?.data || error.message);
    }
}

// Fonction pour tester le rafraîchissement du token
async function testRefreshToken(token) {
    try {
        console.log('\n🔄 Test de rafraîchissement du token...');
        
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Token rafraîchi !');
        console.log('📋 Réponse:', JSON.stringify(response.data, null, 2));
        
        return response.data.token;
        
    } catch (error) {
        console.error('❌ Erreur de rafraîchissement:', error.response?.data || error.message);
        return null;
    }
}

// Fonction pour tester l'accès sans token
async function testUnauthorizedAccess() {
    try {
        console.log('\n🚫 Test d\'accès sans token...');
        
        const response = await axios.get(`${BASE_URL}/planning`);
        console.log('⚠️  Accès autorisé sans token (problème de sécurité)');
        
    } catch (error) {
        console.log('✅ Accès correctement refusé sans token');
        console.log('📋 Erreur:', error.response?.data || error.message);
    }
}

// Fonction pour tester un token invalide
async function testInvalidToken() {
    try {
        console.log('\n🔒 Test avec token invalide...');
        
        const response = await axios.get(`${BASE_URL}/planning`, {
            headers: {
                'Authorization': 'Bearer token_invalide_123'
            }
        });
        console.log('⚠️  Accès autorisé avec token invalide (problème de sécurité)');
        
    } catch (error) {
        console.log('✅ Accès correctement refusé avec token invalide');
        console.log('📋 Erreur:', error.response?.data || error.message);
    }
}

// Fonction principale de test
async function runTests() {
    console.log('🧪 Démarrage des tests JWT...\n');
    
    // Test 1: Connexion
    const token = await testLogin();
    if (!token) {
        console.log('❌ Impossible de continuer sans token');
        return;
    }
    
    // Test 2: Vérification du token
    await testVerifyToken(token);
    
    // Test 3: Accès au planning
    await testPlanningAccess(token);
    
    // Test 4: Inscription
    await testRegister();
    
    // Test 5: Rafraîchissement du token
    const newToken = await testRefreshToken(token);
    
    // Test 6: Accès sans token
    await testUnauthorizedAccess();
    
    // Test 7: Token invalide
    await testInvalidToken();
    
    console.log('\n🎉 Tests JWT terminés !');
}

// Exécution des tests
runTests().catch(console.error);
