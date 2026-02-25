const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: 'prof-espanhol-joel'
    });
}

const db = getFirestore();

const users = [
    { uid: 'S8Tdzl12dAf6RqMFCQKnBgw9J0Z2', name: 'Renata', email: 'renata@profespanhol.com' },
    { uid: 'nbBnC62BGQOJ0QrqyGXH3xu5G5Q2', name: 'Matheus', email: 'matheus@profespanhol.com' },
    { uid: 'T2Uy8utnRlVd9H6DY0ABRU5VFJY2', name: 'Joel', email: 'joel@profespanhol.com' }
];

async function seedFirestore() {
    console.log('--- Seeding Firestore Profiles ---');
    for (const user of users) {
        try {
            await db.collection('users').doc(user.uid).set({
                displayName: user.name,
                email: user.email,
                level: 'A1',
                streak: 0,
                xp: 0,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                learningGoals: [],
                interests: [],
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            }, { merge: true });
            console.log(`✅ Profile created for ${user.name} (${user.uid})`);
        } catch (error) {
            console.error(`❌ Error for ${user.name}:`, error.message);
        }
    }
}

seedFirestore().then(() => process.exit());
