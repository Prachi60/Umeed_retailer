import { MongoClient } from 'mongodb';

const sourceUri = 'mongodb+srv://kosilecommerce_db_user:973Chc5YHtBa3F1i@kosil.fcettwg.mongodb.net/SpeeUp';
const destUri = 'mongodb+srv://speeddo337_db_user:speeddo%21%40%23123@cluster0.q1miqpb.mongodb.net/';

async function testConnection() {
    console.log('Testing source connection...');
    const sourceClient = new MongoClient(sourceUri);
    try {
        await sourceClient.connect();
        console.log('Successfully connected to source database.');
        const db = sourceClient.db('SpeeUp');
        const collections = await db.listCollections().toArray();
        console.log(`Source database 'SpeeUp' has ${collections.length} collections.`);
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} documents`);
        }
    } catch (error) {
        console.error('Failed to connect to source database:', error);
    } finally {
        await sourceClient.close();
    }

    console.log('\nTesting destination connection...');
    const destClient = new MongoClient(destUri);
    try {
        await destClient.connect();
        console.log('Successfully connected to destination database.');
    } catch (error) {
        console.error('Failed to connect to destination database:', error);
    } finally {
        await destClient.close();
    }
}

testConnection();
