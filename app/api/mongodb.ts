
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@calico.sgvrk.mongodb.net/?retryWrites=true&w=majority&appName=calico`;
const Double = require("mongodb").Double; // Insures double datatype

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

interface Transaction{ // Transaction class 
  created: Date,
  cost: typeof Double,

}

export async function doesUserExist(userId: string, userName: string ,emailAddress: string){
  await client.connect(); // Connects to collection
  const dataBase = await client.db("calico_user_data") // Connects to database
  const collection = await dataBase.collection("user") // Connect to collection
  const clientExistResult = await collection.findOne({
    "user_id": userId // first username is the mongoDB field second userName is current userName
  })
  console.log(`result of search ${clientExistResult}, and the userID is ${userId}`)
  if(clientExistResult == null){
    const doc = { "user_id": userId, "user_name": userName, "email": emailAddress, "spending": new Double(0), "savings": new Double(0) };
    await collection.insertOne(doc); 
  }
}
async function loadConnection() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("calico_user_data").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

loadConnection().catch(console.dir);
