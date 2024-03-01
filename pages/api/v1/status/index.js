import database from "infra/database";

async function status(request, response) {
  // data atual
  const updatedAt = new Date().toISOString();

  //  versao do banco - estudar comando show
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;"
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  // const dbOpenedConnectionsResults = await database.query("SELECT count(*) FROM pg_stat_activity WHERE datname = 'local_db';")
  // const dbOpenedConnectionsValue = dbOpenedConnectionsResults[0].count
  // Podemos usar o ::int para já vir do banco convertido.
  const dabaseOpenedConnectionsResults = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    dabaseOpenedConnectionsResults.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connection: parseInt(databaseMaxConnectionsValue),
        opened_connections: parseInt(databaseOpenedConnectionsValue),
      },
    },
  });
}

export default status;
