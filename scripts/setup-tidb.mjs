// Test connexion TiDB Cloud + création du schéma LifeCopilot
import mysql from "mysql2/promise";

const USER = "KyrM8PihRPmCpSN.root";
const PASS = "VvE6DvSnabegmEy1";
const HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
const PORT = 4000;

// 1) Connexion au cluster (db mysql, requis par TiDB pour CREATE DATABASE)
const conn = await mysql.createConnection({
  host: HOST,
  port: PORT,
  user: USER,
  password: PASS,
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
});
console.log("[1] Connexion cluster OK");

// 2) Créer la base lifecopilot si absente
await conn.query("CREATE DATABASE IF NOT EXISTS `lifecopilot`");
console.log("[2] Base `lifecopilot` créée/vérifiée");

// 3) Se connecter à la base lifecopilot
await conn.changeUser({ database: "lifecopilot" });
console.log("[3] Switch vers la base lifecopilot OK");

// 4) Créer le schéma (idempotent)
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(255) NOT NULL UNIQUE,
  loginMethod VARCHAR(50) NOT NULL DEFAULT 'clerk',
  name VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  ageGroup VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_procedures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  procedureKey VARCHAR(100) NOT NULL,
  completedSteps TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_proc (userId, procedureKey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  dueDate DATETIME NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS generated_letters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  letterType VARCHAR(50) NOT NULL,
  situation TEXT NULL,
  senderName VARCHAR(255) NULL,
  senderAddress TEXT NULL,
  recipient VARCHAR(255) NULL,
  extraDetails TEXT NULL,
  content LONGTEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
await conn.query(schema);
console.log("[4] Schéma créé (4 tables)");

const [tables] = await conn.query("SHOW TABLES");
console.log("[5] Tables :", tables.map((t) => Object.values(t)[0]).join(", "));

// 5) Chaîne finale (à utiliser comme DATABASE_URL dans Vercel)
console.log("[6] DATABASE_URL finale :");
console.log(
  `mysql://${USER}:${PASS}@${HOST}:${PORT}/lifecopilot?ssl=true&connectionLimit=5`
);

await conn.end();
console.log("Terminé.");
