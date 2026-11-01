import app from './app.js';
import { env } from './config/env.js';
import { database, verifyDatabaseConnection } from './config/database.js';

try {
  await verifyDatabaseConnection();
  const server = app.listen(env.PORT, () => {
    console.info(`CoreLink API active sur le port ${env.PORT}.`);
  });

  const shutdown = (signal) => {
    console.info(`${signal} reçu, arrêt du serveur.`);
    server.close(async (error) => {
      try {
        await database.end();
      } catch (closeError) {
        console.error('Échec de fermeture de la connexion MySQL.', closeError);
        process.exitCode = 1;
      }
      if (error) {
        console.error('Échec de fermeture du serveur HTTP.', error);
        process.exitCode = 1;
      }
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error('Impossible de démarrer le backend CoreLink.', error);
  process.exitCode = 1;
}
