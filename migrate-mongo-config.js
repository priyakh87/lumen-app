module.exports = {
  mongodb: {
    url: process.env.MONGO_URL || "",
    databaseName: process.env.DB_NAME || "",
    options: {
      useUnifiedTopology: true
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "migrations",
  migrationFileExtension: ".js"
};
