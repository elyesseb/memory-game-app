const { Client } = require("pg");

type QueryResult<T> = {
  rows: T[];
  rowCount: number;
  // D'autres propriétés pouvant être retournées par la fonction query()
};

// Fonction qui exécute une requête SQL sur la base de données et renvoie le résultat
async function executeQuery<T>(query: string): Promise<QueryResult<T[]>> {
  // Crée une nouvelle instance de Client pour se connecter à la base de données
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "memory",
    port: 5432,
    ssl: false,
  });

  try {
    // Ouvre une connexion à la base de données
    await client.connect();
    const res = await client.query(query);
    // Renvoie les lignes sélectionnées
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    // Ferme la connexion à la base de données
    client.end();
  }
}

export { executeQuery };
