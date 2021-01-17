const { ApolloServer, gql, GraphQLScalarType} = require('apollo-server-express');
const http = require('http');
const express = require('express')
const {DateResolver, EmailAddressResolver, PhoneNumberResolver} = require("graphql-scalars")
const {resolvers}  = require("./resolvers")
const {typeDefs} = require("./typeDefs")



const {UsersDataloader, MessagesDataloader, PublicationDataloader} = require("./database")
 
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

// express server
const app = express()

const PORT = process.env.PORT_graphql;

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


server.listen({port: PORT}).then(({url}) => {
  console.log(`the server is runing at ${url}`)
})

