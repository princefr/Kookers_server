const {DateResolver, EmailAddressResolver, PhoneNumberResolver} = require("graphql-scalars")
const { withFilter, PubSub} = require('apollo-server-express');
const {createNewPublication, createNewUser, checkUserExist, 
  createStripeCustomer, getPublicationViaGeohash,
   getPublicationAndUpdateIsOpen, createNewOrder, cancelOrderStripe,
    CreateRoom, createMessage, findAllUserRoom, 
     RateOrder, createReport,
      getConnecedAccountBalance, getPublicationsOwnedByUser,
      getOrderOwnedByUserBuyer, getOrderOwnedByUserSeller, loadCartList, attachPaymentToCustomer,
       updateUserImage, updateSettings, updateUserAdresses, validateOrder, acceptOrder,
        refuseOrder, updateDefaultSource, MakePayout, PayoutList, listExternalAccount,
         createBankAccountOnConnect, getBalanceTransaction, updateAllMessageForUser, updateIbanSource,
          updateFirebasetoken, cleanNotificationSeller, cleanNotificationBuyer, getuserpublic,
           retrieveAccount, setIsSeller, uploadFileStripe, setLike, setDisklike} = require("./database");

const _ = require('lodash');
const { parse , GraphQLScalarType, GraphQLError} = require("graphql");
const BigNumber = require('bignumber.js');

const pubsub = new PubSub();

const Decimal128 = new GraphQLScalarType({
  name: 'Decimal128',
  description: 'The `Decimal` scalar type to represent currency values',

  serialize(value) {
    // value sent to the client
    return parseFloat(value)
  },

  parseValue(value) {
    // value from the client
    if (isNaN(parseFloat(value))) {
      throw new TypeError(
        `${String(value)} is not a valid decimal value.`
      )
    }

    return parseFloat(value)
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(
        `${String(ast.value)} is not a valid decimal value.`
      )
    }

    return parseFloat(ast.value)
  },
})

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const resolvers = {
  Date : DateResolver,
  Email: EmailAddressResolver,
  PhoneNumber: PhoneNumberResolver,
  Decimal128: Decimal128,

  Subscription: {
    messageAdded:  {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['MESSAGE_ADDED']),
        (payload, args) => {
          return payload.messageAdded.roomId == args.roomID
        })
    },

    messageRead : {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['MESSAGE_READ']),
        (payload, args) => {
          return payload.roomId == args.roomID && payload.userID != args.listener
      })
    },


    userIsWriting : {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['USER_IS_WRITING']),
        (payload, args) => {
          return payload.roomId == args.roomID && payload.userID != args.listener
      })
    },

    orderUpdatedBuyer : {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ORDER_UPDATED_BUYER']),
        (payload, args) => {
          console.log(payload.order.buyerID)
          console.log(args.listener)
          return payload.order.buyerID == args.listener
      })
    },

    orderUpdatedSeller : {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ORDER_UPDATED_SELLER']),
        (payload, args) => {
          console.debug(payload)
          console.log(args)
          return payload.order.sellerId == args.listener
      })
    },


    
  },

  Room: {
    messages(parent, args, context) {
      const { loaders } = context
      const {messagesLoader} = loaders
      return messagesLoader.load(parent._id)
    }, 

    receiver(parent, args, context) {
      const { loaders } = context
      const {usersLoader} = loaders
      const users = parent.users.filter((e) => {return e != context.authScope.body.variables.uid}) 
      return usersLoader.load(users[0])
    }
  },


  Publication: {
    seller(parent, args, context) {
      const { loaders } = context
      const {usersLoader} = loaders
      return usersLoader.load(parent.sellerId)
    },

    likes(parent, args, context){
      //const { loaders } = context
      // const {usersLoader} = loaders

      const userCalling = context.authScope.body.variables.userId
      return parent.likes.includes(userCalling)
    }

  }, 

  Order: {
    publication(parent, args, context){
      const { loaders } = context
      const {publicationsLoader} = loaders
      return publicationsLoader.load(parent.productId)
    },

    buyer(parent, args, context){
      const { loaders } = context
      const {usersLoader} = loaders
      return usersLoader.load(parent.buyerID)
    },


    seller(parent, args, context){
      const { loaders } = context
      const {usersLoader} = loaders
      return usersLoader.load(parent.sellerId)
    }

  },

  User: {
    stripeAccount(parent, args, context){
      return retrieveAccount(parent.stripe_account)
    }, 

    balance(parent, args, context){
      return getConnecedAccountBalance(parent.stripe_account)
    },

    transactions(parent, args, context){
      return getBalanceTransaction(parent.stripe_account)
    },

    all_cards(parent, args, context){
      return loadCartList(parent.customerId)
    },

    ibans(parent, args, context) {
      return listExternalAccount(parent.stripe_account)
    }




    
  },

  Query: {
    books: () => books,

    usersExist: async (_, {firebase_uid}) => {
      return checkUserExist(firebase_uid)
    },
    getPublicationViaGeo: async (_, {greather, lesser, userId}) => {
      return getPublicationViaGeohash(greather, lesser, userId)
    },

    getUserRooms: async(_, {userId}) => {
      return  findAllUserRoom(userId)
    },

    accountbalance: async(_, {account_id}) => {
      return getConnecedAccountBalance(account_id)
    },

    getpublicationOwned: async(_, {userId}) => {
      return  getPublicationsOwnedByUser(userId)
    },

    getOrderOwnedBuyer: async(_, {userId}) => {
      return  getOrderOwnedByUserBuyer(userId)
    },

    getOrderOwnedSeller: async(_, {userId}) => {
      return  getOrderOwnedByUserSeller(userId)
    },

    getAllCardsForCustomer: async(_, {customer_id}) => {
      return  loadCartList(customer_id)
    },

    getPayoutList: async(_, {accountId}) => {
      return  PayoutList(accountId)
    },

    listExternalAccount: async(_, {accountId}) => {
      return  listExternalAccount(accountId)
    },


    getBalanceTransaction: async(_, {accountId}) => {
      return  getBalanceTransaction(accountId)
    },

    getuserpublic: async(_, {userId}) => {
      return  getuserpublic(userId)
    },


    

    
    
  },

  Mutation: {
    createUser: async(_, {user}, context, info) => {
      return createNewUser(user, context.authScope.headers["x-forwarded-for"])
    },

    createPublication: async(_, {publication}) => {
      return createNewPublication(publication)
    },

    closePublication: async(_, {publication_id, is_closed}) => {
      return getPublicationAndUpdateIsOpen(publication_id, is_closed)
    },

    createOrder: async(_, {order}) => {
      pubsub.publish('ORDER_UPDATED_SELLER', { order: order});
      return createNewOrder(order)
    },

    cancelOrder: async(_, {order}) => {
      pubsub.publish('ORDER_UPDATED_SELLER', { order: order});
      return cancelOrderStripe(order)
    },

    createRating: async(_, {rating}) => {
      return RateOrder(rating)
    },

    createChatRoom: async(_, {user1, user2, uid})=> {
      return CreateRoom(user1, user2)
    },


    sendMessage: async(_, {message}) => {
      pubsub.publish('MESSAGE_ADDED', { messageAdded: message });
      createMessage(message)
      return true
    },

    createReport: async(_, {report}, context, info) => {
      return createReport(report)
    },

    createCustomer: async(_, {email}) => {
      return createStripeCustomer(email)
    },

    addattachPaymentToCustomer: async(_, {customer_id, methode_id}) => {
      return attachPaymentToCustomer(customer_id, methode_id)
    },

    updateUserImage: async(_, {userID, imageUrl}) => {
      return updateUserImage(userID, imageUrl)
    },

    updateSettings: async(_, {userID, settings}) => {
      return updateSettings(userID, settings)
    },

    updateUserAdresses: async(_, {userID, adresses}) => {
      return updateUserAdresses(userID, adresses)
    },

    validateOrder: async(_, {order}) => {
      pubsub.publish('ORDER_UPDATED_SELLER', { order: order });
      return validateOrder(order)
    },

    refuseOrder: async(_, {order}) => {
      pubsub.publish('ORDER_UPDATED_BUYER', { order: order });
      return refuseOrder(order)
    },

    acceptOrder: async(_, {order}) => {
      pubsub.publish('ORDER_UPDATED_BUYER', { order: order });
      return acceptOrder(order)
    },

    updateDefaultSource: async(_, {userId, source}) => {
      return updateDefaultSource(userId, source)
    },

    updateIbanSource: async(_, {userId, iban}) => {
      return updateIbanSource(userId, iban)
    },

    updateFirebasetoken: async(_, {userId, token}) => {
      return updateFirebasetoken(userId, token)
    },


    makePayout: async(_, {account_id, amount, currency, destination}) => {
      return MakePayout(account_id, amount, currency, destination)
    },

    createBankAccountOnConnect: async(_, {account_id, country, currency, account_number}) => {
      return createBankAccountOnConnect(account_id, country, currency, account_number)
    },


    updateAllMessageForUser: async(_, {userID, roomId}) => {
      pubsub.publish('MESSAGE_READ', { roomId: roomId, userID: userID});
      return updateAllMessageForUser(userID, roomId)
    },


    cleanNotificationSeller: async(_, {orderId}) => {
      return cleanNotificationSeller(orderId)
    },

    

    cleanNotificationBuyer: async(_, {orderId}) => {
      return cleanNotificationBuyer(orderId)
    },

    setIsSeller: async(_, {userId}) => {
      return setIsSeller(userId)
    },

    uploadFile: async(_, {file, type, stripeAccount}) => {
      return file.then(function(_file){
        return uploadFileStripe(_file, type, stripeAccount)
      })
    },


    setLike: async(_, {likeId, userId}) => {
      return setLike(likeId, userId)
    },

    setDisklike: async(_, {likeId, userId}) => {
      return setDisklike(likeId, userId)
    },


  }
}

module.exports = {resolvers}
