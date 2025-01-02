import { Double, MongoClient, PushOperator, ServerApiVersion  } from "mongodb";
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@calico.sgvrk.mongodb.net/?retryWrites=true&w=majority&appName=calico`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function doesUsernameExist(userData: string){ // Needs to be done when social auth is setup- Joey
  if(userData.includes("google")){
  }
}

export async function editTransaction(userId: string, transactionName: string, transactionDate: Date){
  // Add search and edit feature (See if it is possible to search via document id instead)
  console.log(userId,transactionName,transactionDate)
}
  


export async function getRecentTransactions(userId: string){ // Gets last 5 transactions
  userId = userId.split("|")[1] // splits
  const dataBase = client.db("calico_user_data") // Connects to database
  const collections = dataBase.collection("user") // Connect to collection
  const clientExistResult = await collections.findOne({
    "user_id": userId // first username is the mongoDB field second userName is current userName
  })
  return clientExistResult;
}

export async function insertTransaction(userId: string, name: string, cost?: number, date?: Date, description?: string){
  userId = userId.split("|")[1] // splits
  const dataBase = client.db("calico_user_data") // Connects to database
  const collections = dataBase.collection("user") // Connect to collection
  const doc = {
    "name": name, 
    "cost": new Double(cost!), 
    "date": date, 
    "description": description, 
  };
  await collections.updateOne(
    {user_id: userId },
    {$push: { transactions: doc } as PushOperator<Document>}
  ); 
}

export async function doesUserExist(userId: string, userName: string ,emailAddress: string){
  userId = userId.split("|")[1] // splits
  await client.connect(); // Connects to collection
  const dataBase = client.db("calico_user_data") // Connects to database
  const collection = dataBase.collection("user") // Connect to collection
  const clientExistResult = await collection.findOne({
    "user_id": userId // first username is the mongoDB field second userName is current userName
  })
  if(clientExistResult == null){
    const doc = { 
      "user_id": userId, 
      "user_name": userName, 
      "email": emailAddress, 
      "spending": new Double(0), 
      "savings": new Double(0),
      "transactions": [],
    };
    
    await collection.insertOne(doc); 
  }
}
export async function loadConnection() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("calico_user_data").command({ ping: 1 });
}

loadConnection().catch(console.dir);
