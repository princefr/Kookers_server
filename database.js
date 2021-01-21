 const mongoose = require('mongoose');
 const admin = require("firebase-admin")
 const credentialFirebase = require("./admin_credentials.json");
 const stripe = require("stripe")("sk_test_51623aEF9cRDonA7mdWZMgKJ7lVKjYwnKZmZLra2vdJSkrIrfYOe6uXRpZHS0kAYgdQOQBJRaw0hqgznFLP52Oal400AvkyDjeO");
 const DataLoader = require("dataloader");
 const {groupBy, map} = require("ramda");
 var moment = require('moment');

 mongoose.set('useNewUrlParser', true);
 mongoose.set('useFindAndModify', false);
 mongoose.set('useCreateIndex', true);
 mongoose.set('useUnifiedTopology', true);

 const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
 
  // Optional depending on the providers

  apiKey: 'AIzaSyAbJoAWoANYPFagvaiNOAd8vJZGY7SV0Hs', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

 admin.initializeApp({
  credential: admin.credential.cert(credentialFirebase),
  databaseURL: 'https://kookers-4e54e.firebaseio.com'
});

 mongoose.connect('mongodb+srv://princeondonda:4qF0PF11794591@cluster0.myzbc.mongodb.net/<dbname>?retryWrites=true&w=majority', {useNewUrlParser: true});
 const Schema = mongoose.Schema;

 var FoodPreferenceSchema = new Schema({
  id: Number,
  title: String,
  is_selected: Boolean
}, { _id : false })

var FoodPriceRangeSchema = new Schema({
  id: Number,
  title: String,
  is_selected: Boolean
}, { _id : false })

var LocationSchema = new Schema({
  latitude: Number,
  longitude: Number
}, { _id : false })

var Adress = new Schema({
  title: String,
  location: LocationSchema,
  is_chosed: Boolean
}, { _id : false })



var Rating = new Schema({
  rating_total:{type: Number, default: 0.0} ,
  rating_count: {type: Number, default: 0}
}, { _id : false })

 var UserSettingsSchema = new Schema({
   food_preferences: [FoodPreferenceSchema],
   food_price_ranges : [FoodPriceRangeSchema],
   distance_from_seller:  Number,
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now }
 }, { _id : false })

 var UserSchema = new Schema ({
   id: mongoose.ObjectId,
   email: {type: String, required: true},
   first_name: {type: String, required: true},
   last_name: {type: String, required: true},
   phonenumber: {type: String, required: true},
   settings: {type: UserSettingsSchema, default: {
    "distance_from_seller": 45,
    "food_preferences": [{id: 0, title: "Végétarien", is_selected: false}, {id: 1, title: "Vegan", is_selected: false}, {id: 2, title: "Sans gluten", is_selected: false},
    {id: 3, title: "Hallal", is_selected: false}, {id: 4, title: "Adapté aux allergies alimentaires", is_selected: false}],
    "food_price_ranges": [{id: 0, title: "$", is_selected: false}, {id: 1, title: "$$", is_selected: false}, {id: 2, title: "$$$", is_selected: false}, {id: 3, title: "$$$$", is_selected: false}]
   }},
   adresses: [Adress],
   firebaseUID: {type: String, required: true},
   customerId: String,
   createdAt: { type: String, default: new Date().toISOString(), required: true},
   updatedAt: { type: String, default: new Date().toISOString(), required: true },
   fcmToken: {type: String, required: true},
   photoUrl: String,
   default_source: {type: String, default: ""},
   stripe_account: {type: String},
   is_terms_accepted : {type: Boolean, required: true, default: true},
   country: {type: String, required: true},
   currency: {type: String, required: true},
   user_baned: {type: Boolean, default: false},
   birth_date: {type: String},
   birth_place: String,
   is_recto_id: Boolean,
   is_verso_id: Boolean,
 })

 var RoomSchema = new Schema({
   id: mongoose.ObjectId,
   createdAt: { type: String, default: new Date().toISOString() , required: true},
   updatedAt: { type: String, default: new Date().toISOString(), required: true},
   last_message: {type: String, default: ""},
   notificationCountUser_1: { type: Number, default: 0 , required: true},
   notificationCountUser_2: { type: Number, default: 0 , required: true},
   users: [{type: Schema.Types.ObjectId, ref: 'Users', required: true}, {type: Schema.Types.ObjectId, ref: 'Users', required: true}]
 })


 var MessageSchema = new Schema({
   id: mongoose.ObjectId,
   roomId: {type: Schema.Types.ObjectId, required: true, ref: 'Rooms'},
   createdAt: { type: String, default: new Date().toISOString() },
   userId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
   message: {type: String, required: true},
   message_photo: String
 })



 var OrderSchema = new Schema({
   id: mongoose.ObjectId,
   productId: {type: Schema.Types.ObjectId, ref: 'Publications'},
   description: String,
   stripeTransactionId: {type: String, required: true},
   quantity: Number,
   total_price: Number,
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now },
   buyerID: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
   orderState: {type: String, required: true},
   refoundId: String,
   sellerId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
   seller_stripe_account:{type: String, required: true},
   payment_method_id: {type: String, required: true},
   deliveryDay: String,
   currency: {type: String, required: true},
   fees: {type: String, required: true}
 })

 var PublicationSchema = new Schema({
   id:  mongoose.ObjectId,
   title: {type: String, required: true},
   description: {type: String, required: true},
   type: {type: String, required: true},
   food_preferences: [FoodPreferenceSchema],
   price_all: Number,
   price_per_pie: Number,
   adress: Adress,
   photoUrls: [{type: String, required: true}],
   sellerId: {type: Schema.Types.ObjectId, ref: 'Users'},
   is_open: {type: Boolean, required: true, default: true},
   geohash: {type: String, required: true},
   rating : {type: Rating, default: {rating_total: 0.0, rating_count: 0}},
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now },
 })


 var ReportSchema = new Schema({
   id: mongoose.ObjectId,
   type: {type: String, required: true},
   userReported: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
   userReporting: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
   description: String,
   createdAt: { type: String, default: new Date().toISOString() },
   updatedAt: { type: String, default: new Date().toISOString() },
   solved: {type: Boolean, default: false}
 })


 var RatingSchema = new Schema({
  rate: {type: Number, required: true},
  comment: String,
  publicationId: {type: Schema.Types.ObjectId, ref: 'Publications', required: true},
  orderId: {type: Schema.Types.ObjectId, ref: 'Orders', required: true},
  whoRate: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
  createdAt: { type: String, default: new Date().toISOString() },
 })


 
 ///// Payment logic with stripe
 
async function createStripeCustomer(email) {
  const result = await stripe.customers.create({email: email}).catch(err => {console.log(err)})
  return result.id
}


 function percentage(percent, total) {
  return ((percent/ 100) * total).toFixed(2)
}


 async function createPaymentIntent(total, currency, paymentmethod, connectedAccount, customer) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: currency,
    customer : customer,
    description: "Kookers commande- ",
    payment_method: paymentmethod,
    confirm: false,
    receipt_email: "pondonda@gmail.com",
    application_fee_amount: parseInt(percentage(30, total)),
    transfer_data: {
      destination: connectedAccount,
    },
    
  }).catch((err) => {throw err});

  



  return paymentIntent;
 }



 async function confirmPaymentIntent(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.confirm(
    paymentIntentId
  );

  return paymentIntent;
 }


 async function cancelPaymentIntent(paymentIntentId, cancellation_reason){
  const paymentIntent = await stripe.paymentIntents.cancel(
    paymentIntentId, {cancellation_reason: cancellation_reason}
  );

  return paymentIntent;
 }






 async function createStripeCustomAccount(user, ip){
  const res_geocode = await geocoder.geocode(user.adresses[0].title);
  const account = await stripe.accounts
  .create({type: 'custom',  country: user.country, email: user.email,
   capabilities: {transfers: {requested: true},}, tos_acceptance: {
    ip: ip,
    date: Math.floor(Date.now() / 1000),
  }, business_type: "individual", individual : {
    address : {
      city: res_geocode[0].city,
      country: user.country,
      line1: res_geocode[0].streetNumber + " " + res_geocode[0].streetName,
      postal_code: res_geocode[0].zipcode,
      state: res_geocode[0].administrativeLevels.level1long
    },
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phonenumber
  }
})
  .catch(err => {console.log(err)})
  return account
 }


 async function retrieveAccount(acount_id){
  const account = await stripe.accounts.retrieve(acount_id).catch(err => {console.log(err)});
  return account
 }


 async function getConnecedAccountBalance(acount_id){
   const account  = await stripe.balance.retrieve({stripeAccount: acount_id}).catch(err => {console.log(err)})
   return {current_balance: account.available[0].amount, pending_balance: account.pending[0].amount, currency: account.available[0].currency}
 }


 async function getBalanceTransaction(accountId){
   const transactions =  await stripe.balanceTransactions.list({stripeAccount: accountId}).catch(err => {console.log(err)})
   return transactions.data
 }

 async function createBankAccountOnConnect(account_id, country, currency, account_number){
  const bankAccount = await stripe.accounts.createExternalAccount(account_id, { external_account: {
    object: "bank_account",
    country: country,
    currency:  currency,
    account_number: account_number
  }}
  ).catch(err => {console.log(err)});

  return bankAccount
 }

 async function listExternalAccount(account_id) {
  const accountBankAccounts = await stripe.accounts.listExternalAccounts(
    account_id
  );
  return accountBankAccounts.data
 }


 async function MakePayout(account_id, amount, currency) {
  const payout = await stripe.payouts.create({
    amount: amount,
    currency: currency,
  }, {
    stripeAccount: account_id,
  })

  return payout
 }


 async function PayoutList(account_id) {
  const payouts = await stripe.payouts.list({stripeAccount: account_id,});
  return payouts.data
 }




 async function loadCartList(customer) {
  const cards = await stripe.paymentMethods.list({customer: customer, type: "card"});
  return cards.data.map((element) => {
    return {"id": element.id,  "brand": element.card.brand,
    "country": element.card.country, "exp_month": element.card.exp_month,
     "exp_year": element.card.exp_year, "customer": element.card.customer,
      "cvc_check": element.card.cvc_check, "last4": element.card.last4, "funding": element.card.funding}
  });
 }



 async function attachPaymentToCustomer(customer_id, methode_id) {
  const paymentMethod = await stripe.paymentMethods.attach(
    methode_id,
    {customer: customer_id}
  );

  return paymentMethod
 }




////// firebase file storage.
async function uploadOneFile(file_data){
  const bucket  = admin.storage.bucket()
  const fileUploaded = await bucket.uploadOneFile(file_data).catch(err => {console.log("error")})
  return fileUploaded
}


////// Business logic functions of the database


 async function ValidateAuthData(authData) {
   const decodedToken = await admin.auth().verifyIdToken(authData.access_token).catch(err => {throw err})
   if (decodedToken && decodedToken.uid == authData.id) {
      return;
    }else{
      throw new Error('Firebase auth not found for this user.')
    }
 }

 async function connectToFirebase(authData){
  const valided = await ValidateAuthData(authData)
  return valided
 }



 /////// user handling

 async function createNewUser(user_input, ip) {
   const User = mongoose.model('User', UserSchema);
   const customerId = await createStripeCustomer(user_input.email)
   const stripeAccount = await createStripeCustomAccount(user_input, ip)
   user_input.customerId =  customerId
   user_input.stripe_account = stripeAccount.id

   const user = new User(user_input)
   const saved = await user.save().catch(err => {console.log(err)})
   console.log(saved)
   return saved
}

async function checkUserExist(firebase_uid){
  const User = mongoose.model('User', UserSchema);
  return User.findOne({"firebaseUID": firebase_uid})
}

async function getUserById(userId) {
  const User = mongoose.model('User', UserSchema);
  return User.findOne({"_id": userId})
}




function UsersDataloader() {
  return new DataLoader(findUsersbyIds)
}

async function findUsersbyIds(ids) {
  const User = mongoose.model('User', UserSchema);
  const users = await User.find({"_id": {$in: ids}}).exec()
  const groupedById = groupBy(user => user._id, users)
  const mapped = map(user => groupedById[user._id], ids)
  return mapped.flat()
}


async function updateUser(userId, user) {
  const User = mongoose.model('User', UserSchema)
  return User.findOneAndUpdate({id: userId}, {user})
}


async function updateDefaultSource(userId, source) {
  const User = mongoose.model('User', UserSchema)
  await User.findOneAndUpdate({"_id": userId}, {"default_source": source})
  const updated  = await User.findById(userId)
  return updated.default_source

}


async function updateUserImage(userId, imageUrl){
  const User = mongoose.model('User', UserSchema)
  await User.findOneAndUpdate({"firebaseUID": userId}, {"photoUrl": imageUrl})
  return User.findOne({"firebaseUID": userId})
}


async function updateSettings(userId, settings){
  const User = mongoose.model('User', UserSchema)
  await User.findOneAndUpdate({"firebaseUID": userId}, {"settings": settings})
  return User.findOne({"firebaseUID": userId})
}

async function updateUserAdresses(userId, adresses){
  const User = mongoose.model('User', UserSchema)
  await User.findOneAndUpdate({"firebaseUID": userId}, {"adresses": adresses})
  return User.findOne({"firebaseUID": userId})
}

///// publication handling

 async function createNewPublication(publication_input) {
   const Publication = mongoose.model("Publication", PublicationSchema)
   const publication = new Publication(publication_input)
   await publication.save().catch(err => {console.log(err)})
   return publication
 }


 async function getPublicationByid(pubId) {
  const Publication = mongoose.model("Publication", PublicationSchema)
  return Publication.findById(pubId)
 }


 function PublicationDataloader() {
  return new DataLoader(findPublicationByIds)
}


 async function findPublicationByIds(ids){
  const Publication = mongoose.model("Publication", PublicationSchema)
  const publications = await Publication.find({"_id": {$in: ids}}).exec()
  const groupedById = groupBy(pub => pub._id, publications)
  const mapped = map(pub => groupedById[pub._id], ids)
  return mapped.flat()
 }




 async function getPublicationViaGeohash(lowervalue, greathervalue, userId) {
  const Publication = mongoose.model("Publication", PublicationSchema)
  return await Publication.find({"geohash": {$gte: lowervalue, $lte:greathervalue}, "sellerId": {$ne: userId}}).exec()
 }

 async function getPublicationsOwnedByUser(userId){
  const Publication = mongoose.model("Publication", PublicationSchema)
  const pub = Publication.find().where("sellerId").equals(userId).exec()
  console.log(await pub)
  return pub
 }




 async function getPublicationAndUpdateIsOpen(pubId, is_open){
  const Publication = mongoose.model("Publication", PublicationSchema)
  const publication =  await Publication.findOneAndUpdate({_id: pubId}, {is_open: is_open, updateAt: Date.now() }).catch(error => {console.log(error)})
  return publication
 }





 /////// order handling

 async function createNewOrder(order_input) {
   const seller = await getUserById(order_input.sellerId)
   const Order = mongoose.model("Order", OrderSchema)
   const paymentIntent = await createPaymentIntent(order_input.total_price * 100, order_input.currency, order_input.payment_method_id, seller.stripe_account, order_input.customerId).catch((err) => {throw err})
   
   order_input.stripeTransactionId = paymentIntent.id
   order_input.fees = parseInt(percentage(30, order_input.total_price))
   const order = new Order(order_input)
   await order.save().catch(err => {console.log(err)})
   sendNotification(seller.fcmToken, "Commande", "Vous avez une nouvelle commande")
   return true
 }


 async function cancelOrderStripe(order_input) {
   const cancel_reason = ["duplicate", "fraudulent", "requested_by_customer",  "abandoned"]
   const refound = await cancelPaymentIntent(order_input.stripeTransactionId, cancel_reason[2]).catch(err => {throw err})
   order_input.refoundId = refound.id
   order_input.orderState = "CANCELLED"
   order_input.updatedAt = new Date().toISOString()
   const updated = await UpdateOrder(order_input, true)
  return updated
 }


 async function validateOrder(order_input){
  await confirmPaymentIntent(order_input.stripeTransactionId).catch(err => {throw err})
  order_input.orderState = "DONE"
  order_input.updatedAt = new Date().toISOString()
  const updated = await UpdateOrder(order_input, false)
  return updated
 }


 async function refuseOrder(order_input) {
  const cancel_reason = ["duplicate", "fraudulent", "requested_by_customer",  "abandoned"]
  const refound = await cancelPaymentIntent(order_input.stripeTransactionId, cancel_reason[2]).catch(err => {throw err})
  order_input.refoundId = refound.id
  order_input.orderState = "REFUSED"
  order_input.updatedAt = new Date().toISOString()
  const updated = await UpdateOrder(order_input, true)
  return updated
 }

 async function acceptOrder(order_input) {
  order_input.orderState = "ACCEPTED"
  order_input.updatedAt = new Date().toISOString()
  const updated = await UpdateOrder(order_input, false)
  return updated
 }


 async function ChangeOrderState(orderId, status){
  const Order = mongoose.model("Order", OrderSchema)
  await Order.findOneAndUpdate({"_id": orderId}, {"orderState": status, updatedAt: new Date().toISOString()})
  const updated = await Order.findById(orderId)
  return updated
 }




 async function getOrderOwnedByUserBuyer(userId) {
  const Order = mongoose.model("Order", OrderSchema)
  return Order.find().where("buyerID").equals(userId).exec()
 }
 
 async function getOrderOwnedByUserSeller(userId) {
  const Order = mongoose.model("Order", OrderSchema)
  return Order.find().where("sellerId").equals(userId).exec()
 }




 async function UpdateOrder(order, with_refound) {
   const Order = mongoose.model("Order", OrderSchema)
   if(with_refound){
    await Order.findOneAndUpdate({"_id": order.id}, {"orderState": order.orderState, "updatedAt": order.updatedAt})
   }else{
    await Order.findOneAndUpdate({"_id": order.id}, {"orderState": order.orderState, "updatedAt": order.updatedAt, "refoundId": order.refoundId})
   }
   
   const updated = await Order.findById(order.id)
   return updated
 }



 
 /////// chat handling

 async function CreateRoom(user1, user2) {
  const Room = mongoose.model("Room", RoomSchema)
  const roomExist = await Room.exists({users: {$all : [user1, user2]}})
  if (roomExist) {
    return Room.findOne({users: {$all : [user1, user2]}})
  }else{
    const room = await new Room({users: [user1, user2]}).save()
    return room
  }
 }

 async function findAllUserRoom(userId){
  const Room = mongoose.model("Room", RoomSchema)
  return Room.find({users: {$in : [userId]}})
 }


 async function createMessage(messageInput) {
   const Message = mongoose.model("Message", MessageSchema)
   const message = new Message(messageInput)
   const saved = await message.save().catch(err => {console.log(err)})
   return  saved
 }


 async function loadAllMessageForRoom(roomId){
  const Message = mongoose.model("Message", MessageSchema)
  const messages = await Message.find({"roomId": roomId})
  return messages
 }


 function MessagesDataloader() {
  return new DataLoader(LoadallMessageForRoombyIds)
}

 async function LoadallMessageForRoombyIds(ids) {
  const Message = mongoose.model("Message", MessageSchema)
  const messages = await Message.find({"roomId": {$in: ids}}).exec()
  const groupedById = groupBy(user => user.roomId, messages)
  const mapped = map(roomid=> groupedById[roomid], ids)
  return mapped
}




 ///////// report handling

 async function createReport(report_input){
  const Report = mongoose.model("Report", ReportSchema)
  const report = new Report(report_input)
   await report.save().catch(err => {console.log(err)})
   return report
 }

 /// ratingHandling

 async function RateOrder(rating_input) {
   const Rate = mongoose.model("Rating", RatingSchema)
   const rate = new Rate(rating_input)
   await rate.save().catch(err => {console.log(err)})
   await ChangeOrderState(rating_input.orderId, "RATED")
   const publication = await getPublicationByid(rating_input.publicationId)
   publication.rating.rating_total = parseFloat(publication.rating.rating_total) + parseFloat(rating_input.rate)
   publication.rating.rating_count = parseInt(publication.rating.rating_count) + 1
   await  publication.save().catch(err => {console.log(err)})
   return rate
 }

 /////// notification handler.
 async function sendNotification(registrationToken, title, body) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    apns: {
      payload : {
        aps : {
          sound:"default"
        }
      }
  } ,
    android: {
      notification: {
        sound: "default"
      }
    }, 
    token: registrationToken
  };
   const notif = await admin.messaging().send(message)
   return notif
 }










 module.exports = { mongoose,
   createNewPublication, createNewUser,
    checkUserExist, createStripeCustomer, 
    getPublicationViaGeohash,
    getPublicationAndUpdateIsOpen, createNewOrder,
    cancelOrderStripe, CreateRoom, createMessage,
    findAllUserRoom, loadAllMessageForRoom, getUserById,
     RateOrder, createReport, getConnecedAccountBalance,
      getPublicationsOwnedByUser,
      getOrderOwnedByUserBuyer, getOrderOwnedByUserSeller,
       getPublicationByid, UsersDataloader, MessagesDataloader,
        PublicationDataloader, loadCartList, attachPaymentToCustomer,
         updateUserImage, updateSettings, updateUserAdresses, validateOrder, refuseOrder, acceptOrder,
          updateDefaultSource, createBankAccountOnConnect, MakePayout, PayoutList, listExternalAccount, getBalanceTransaction}

