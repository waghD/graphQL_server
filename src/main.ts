import { ApolloServer } from 'apollo-server';

import { environment } from './environment';
import resolvers from './resolvers';
import typeDefs from './schemas';

/**
 * Starts Server to listen on port specified in .env file.
 * Hands over the handler functions and the scheme to define the GraphQL API.
 */
const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: environment.apollo.introspection,
  playground: environment.apollo.playground
});

server.listen(environment.port)
  .then(({ url }) => console.log(`Server ready at ${url}. `));

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.stop());
}