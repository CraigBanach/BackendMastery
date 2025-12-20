import { Client } from 'pg';

export async function resetDatabase() {
  const client = new Client({
    connectionString: 'postgres://postgres:password@localhost:5435/personifi_db',
  });

  try {
    await client.connect();
    // Truncate main tables. CASCADE should handle dependencies.
    // "Users" is usually the root of ownership.
    // "Transactions", "Accounts", "Budgets", "Categories", "Subscriptions" etc.
    // We quote table names because they are PascalCase in the SQL schema provided.
    
    console.log('Resetting database...');
    
    // We use TRUNCATE with CASCADE. 
    // We target "Subscriptions" and "Users" as high level entities.
    await client.query('TRUNCATE TABLE "Users", "Subscriptions" CASCADE');
    
    console.log('Database reset complete.');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  } finally {
    await client.end();
  }
}
