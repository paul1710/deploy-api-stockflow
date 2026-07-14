const { Sequelize } = require("sequelize")
require("dotenv").config()

// Forzar la validación de credenciales antes de inicializar para evitar fallos silenciosos
if (!process.env.DB_PASSWORD) {
    console.error("CRÍTICO: La variable de entorno DB_PASSWORD no está cargada. Revisa tu archivo .env");
    process.exit(1);
}

const sequelize = new Sequelize(
    process.env.DB_NAME,      // Apunta a "prueba_victor"
    process.env.DB_USER,      // Apunta a "postgres"
    process.env.DB_PASSWORD,  // Apunta a "Diosmio46"
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
    }
)

module.exports = sequelize