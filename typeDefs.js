
const {gql } = require('apollo-server-express');
const {Stripe} = require('stripe')

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  scalar Date
  scalar Email
  scalar PhoneNumber
  scalar Decimal128


  type Book {
    title: String
    author: String
  }


  enum SellingType {
    PLATES
    DESSERTS
  }

  enum OrderState {
    NOT_ACCEPTED
    ACCEPTED
    REFUSED
    DONE
    RATED
    CANCELLED
  }


  input FoodPreferenceInput {
    id: Int
    title: String
    is_selected: Boolean
  }

  type FoodPreference {
    id: Int
    title: String
    is_selected: Boolean
  }

  input PublicationInput {
    id: ID
    title: String!
    description: String!
    type: SellingType!
    food_preferences: [FoodPreferenceInput]!
    price_all: String!
    price_per_pie: String!
    adress: AdressInput!
    photoUrls: [String]!
    sellerId: String!
    geohash: String!
  }

  type Publication {
    _id: ID!
    title: String!
    description: String!
    type: SellingType!
    food_preferences: [FoodPreference]!
    price_all: Float!
    price_per_pie: Float!
    adress: Adress
    photoUrls: [String]!
    sellerId: String!
    is_open: Boolean!
    geohash: String!
    createdAt: Date
    updateAt: Date
    seller: User
    rating: RatingUser
  }


  input RatingInsideInput {
    rating_count: Int
    rating_total: Float
  }


  type Balance {
    current_balance: String
    pending_balance: String
    currency: String
  }

  input BirthDate {
    day: Int!
    month: Int!
    year: Int!
    iso: String!
  }


  input UserInput {
    id: ID
    adresses: [AdressInput]
    createdAt: String
    display_name: String!
    email: String!
    fcmToken: String!
    first_name: String!
    last_name: String!
    phonenumber: String!
    photoUrl: String
    firebaseUID: String!
    rating: RatingInsideInput
    settings: UserSettingsInput
    updatedAt : String
    country: String!
    currency: String!
    birth_date: BirthDate!
  }


  

  type User {
    _id: ID!
    firebaseUID: String!
    email: Email!
    first_name: String!
    last_name: String!
    phonenumber: String!
    settings: UserSettings
    createdAt: String!
    photoUrl: String
    customerId: String
    updatedAt : String!
    adresses : [Adress]
    fcmToken: String
    rating: RatingUser
    country: String
    currency: String
    default_source: String
    default_iban: String
    stripe_account: String
  }

  input LocationInput {
    latitude: Float
    longitude: Float
  }

  type Location {
    latitude: Float
    longitude: Float
  }

  

  input AdressInput {
    title: String
    location: LocationInput
    is_chosed: Boolean
  }

  type Adress {
    title: String
    location: Location
    is_chosed: Boolean
  }





  input OrderInputBuyer {
    id: ID
    productId: String
    quantity: Int
    stripeTransactionId: String
    sellerId: String
  }


  input OrderInput {
    id: ID
    productId: String
    quantity: Int
    total_price: String
    createdAt: String
    updatedAt: String
    deliveryDay: String!
    buyerID: String!
    orderState: OrderState!
    sellerId: String!
    currency: String
    stripeTransactionId: String
    seller_stripe_account: String
    payment_method_id: String
    customerId: String
  }

  type Order {
    _id: ID!
    productId: String
    stripeTransactionId: String
    quantity: String
    total_price: String
    createdAt: String
    updateAt: String
    buyerID: String
    deliveryDay: String
    orderState: OrderState
    sellerId: String
    publication: Publication
    seller: User
    buyer: User
    currency: String
  }


  type FoodPriceRange {
    id: Int
    title: String
    is_selected: Boolean
  }

  input FoodPriceRangeInput {
    id: Int
    title: String
    is_selected: Boolean
  }


  input MessageInput {
    id: ID
    createdAt: String!
    message: String!
    userId: String!
    roomId: ID!
    message_picture: String
    receiver_push_token: String
  }


  type Message {
    id: ID
    createdAt: String
    message: String!
    userId: String!
    roomId: ID!
    message_picture: String
    is_sent: Boolean
    is_read: Boolean
  }



  type Room {
    _id: ID!
    createdAt: String!
    updatedAt: String!
    last_message: String
    messages: [Message]
    notificationCountUser_1: Int
    notificationCountUser_2: Int
    users: [String!]!
    receiver: User

  }


  input UserSettingsInput {
    food_preferences: [FoodPreferenceInput]
    food_price_ranges : [FoodPriceRangeInput]
    distance_from_seller: Float!
    createdAt: String
    updatedAt: String
    notification_enabled: Boolean
  }

  type UserSettings {
    food_preferences: [FoodPreference]
    food_price_ranges : [FoodPriceRange]
    distance_from_seller: Float
    createdAt: Date
    updatedAt: Date
  }


  input RatingInput {
    rate: String!
    comment: String
    publicationId: String!
    orderId: String!
    whoRate: String!
    createdAt: String
  }


  type Rating {
    rate: Int!
    comment: String
    publicationId: String!
    orderId: String!
    whoRate: String!
    createdAt: Date
  }

  type RatingUser {
    rating_total: Float
    rating_count: Int
  }



  enum ReportStatus {
    PENDING
    SOLVED
    INVESTIGATEIN
    CLOSED
  }


  enum ReportType {
    NOTINTERRESTED
    SPAM
    COPYFRAUD
    ARNAQUE
  }


  input ReportInput {
    type: ReportType
    userReported: String
    userReporting: String
    description: String

  }


  type PaymentMethod {
    id: String!,
    object: String!,
  }

  type CreditCard {
    id: String,
    brand: String,
    country: String,
    customer: String,
    cvc_check: String,
    exp_month: Int,
    exp_year: Int,
    fingerprint: String,
    funding: String,
    last4: String,
  }


  type Report {
    _id: ID!
    type: ReportType
    userReported: String
    userReporting: String
    description: String
    createdAt: String
    updatedAt: String
    status: ReportStatus
  }


  type ServerResponse {
    success: Boolean
    error: Error
  }

  type Error {
    type: String
    message: String
  }


  type Payout {
    id: String
    object: String
    arrival_date: Int
    amount: Float
    type: String
    status: String
    description: String
  }


  type BankAccount {
    id: String
    object: String
    account_holder_name: String
    account_holder_type: String
    bank_name: String
    country: String
    currency: String
    last4: String
  }


  type TransactionStripe {
    id: String!
    object: String
    amount: Float
    available_on: Int
    created: Int
    currency: String
    description: String
    fee: Int
    net: Int
    reporting_category: String
    type: String
    status: String
  }


  type IsRead {
    roomId: String,
    isRead: String
  }



  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).

  type Subscription {
    messageAdded(roomID: ID!): Message
    messageRead(roomID: ID!, listener: String): Boolean
    userIsWriting(roomID: ID!): Boolean
    orderUpdated(id: ID!): Order
    roomUpdated(id: ID!): Room
    
  }

  type Query {
    books: [Book]
    usersExist(firebase_uid: String): User
    getPublicationViaGeo(greather: String!, lesser: String!, userId: String!): [Publication]!
    getUserRooms(userId: String!): [Room]
    accountbalance(account_id: String): Balance!
    getpublicationOwned(userId: String): [Publication]!
    getOrderOwnedBuyer(userId: String): [Order]!
    getOrderOwnedSeller(userId: String): [Order]!
    getAllCardsForCustomer(customer_id: String!): [CreditCard]!
    getPayoutList(accountId: String!): [Payout]!
    listExternalAccount(accountId: String!): [BankAccount]!
    getBalanceTransaction(accountId: String!): [TransactionStripe]!
    

  }


  type Mutation {
    createUser(user: UserInput): User!
    createPublication(publication: PublicationInput): Publication!

    createOrder(order: OrderInput): Boolean!
    cancelOrder(order: OrderInput): Order!

    createRating(rating: RatingInput): Rating!
    createReport(report: ReportInput): Report!



    createCustomer(email: String): String!
    closePublication(publication_id: String, is_closed: Boolean): Publication!
    

    createChatRoom(user1: String!, user2: String!): Room!
    sendMessage(message: MessageInput): Boolean!
    updateAllMessageForUser(userID:String, roomId: String): Boolean!

    addattachPaymentToCustomer(customer_id: String!, methode_id: String!): PaymentMethod
    updateUserImage(userID: String!, imageUrl: String!): User!
    updateSettings(userID: String!, settings: UserSettingsInput!): User!
    updateUserAdresses(userID: String!, adresses: [AdressInput]!): User!
    validateOrder(order: OrderInputBuyer): Order!
    refuseOrder(order: OrderInput): Order!
    acceptOrder(order: OrderInput): Order!
    updateDefaultSource(userId: String!, source: String!): String!
    updateIbanSource(userId: String!, iban: String!): String!
    createBankAccountOnConnect(account_id: String!, country:String!, currency: String!, account_number: String!): BankAccount
    makePayout(account_id: String!, amount: String!, currency: String!): Payout

    

  }

`;


module.exports = {typeDefs}
