import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground"
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { myFormatError } from "./config/errors";
import { GraphiQLPlugin, DocsPlugin } from "./config/graphiql";

import { PrayersResolver } from "./resolvers/Prayers";
import { ParametersResolver } from "./resolvers/Parameters";

const PORT = process.env.PORT || 2203;

(async () => {
  const schema = await buildSchema({
    resolvers: [PrayersResolver, ParametersResolver],
    dateScalarMode: "timestamp",
    emitSchemaFile: {
      path: __dirname + "/schema.gql",
      sortedSchema: false,
    },
    validate: { forbidUnknownValues: false },
  });

  const app = express();

  const server = new ApolloServer({
    schema,
    introspection: true,
    formatError: myFormatError,
    plugins: [GraphiQLPlugin]
  });

  const docsServer = new ApolloServer({
    schema,
    introspection: true,
    formatError: myFormatError,
    plugins: [DocsPlugin]
  })

  await server.start();
  await docsServer.start();

  app.use(
    "/docs",
    cors<cors.CorsRequest>(),
    express.json({ limit: "10mb" }),
    expressMiddleware(docsServer)
  );

  app.use(
    "/",
    cors<cors.CorsRequest>(),
    express.json({ limit: "10mb" }),
    expressMiddleware(server)
  );

  

  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}`)
  );
})();
