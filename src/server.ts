import express, { Express } from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';

import { auradb } from './secrets';

export function createServer(): Express {
  const typeDefs = gql(
    readFileSync(join(__dirname, '..', 'schema.graphql'), 'utf-8'),
  );

  const driver = neo4j.driver(
    auradb.uri,
    neo4j.auth.basic(auradb.username, auradb.password),
  );

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

  const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ req }),
    introspection: true,
    playground: true,
  });

  const app = express();

  server.applyMiddleware({ app, cors: true });

  return app;
}
