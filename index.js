const { ApolloServer, gql, GraphQLScalarType} = require('apollo-server-express');
const http = require('http');
const express = require('express')
const {DateResolver, EmailAddressResolver, PhoneNumberResolver} = require("graphql-scalars")
const {resolvers}  = require("./resolvers")
const {typeDefs} = require("./typeDefs")
var path = require('path')



const {UsersDataloader, MessagesDataloader, PublicationDataloader} = require("./database")
 
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

// express server
const app = express()
const router = express.Router();

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {}},
    context: (req) => ({
      authScope: req.req,
      loaders: {
        usersLoader: UsersDataloader(),
        messagesLoader: MessagesDataloader(),
        publicationsLoader: PublicationDataloader()
      }
    })

})


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});




server.applyMiddleware({app});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);


httpServer.listen({port: process.env.PORT || 4000}, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  console.log(server.graphqlPath)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})

