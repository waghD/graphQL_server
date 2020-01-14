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

/**
 * Launch Frontend Server
 */
var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../frontend/main.html'), { root: __dirname });
});

app.use('/css', express.static(__dirname + '/frontend/css'));
app.use('/js', express.static(__dirname + '/frontend/js'));
app.use('/assets', express.static(__dirname + '/frontend/assets'));

app.listen(4001);