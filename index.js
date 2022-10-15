import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient } from 'mongodb'


const app = express();


dotenv.config();

// const mongoDB_connection_string = "mongodb://127.0.0.1";
const mongo_url = process.env.mongo_url

async function createConnection(){
    const client = new MongoClient(mongo_url);
    await client.connect();
    console.log("Mongo DB is connected");
    return client
}

const client = await createConnection();


app.use(express.json());
app.use(cors())


app.get('/', function (req, res) {
  res.send('Hello World')
})


app.get("/search/:id", async function(req, res){
    const{id} = req.params;
    const query_res = await client.db("task_hr").collection("company_info").aggregate([
        {$lookup: {
            from: "products_info",
            localField: "_id",
            foreignField: "companyId",
            as: "product_detail"
        }},
        {$unwind: "$product_detail"},
        {$match: {$or: [{name : {$regex: id, $options: "i"}}, {"product_detail.headline": {$regex: id, $options: 'i'}}, {"product_detail.primaryText": {$regex: id, $options: 'i'}} ]}}
    ]).toArray();
    console.log(query_res);
    query_res[0] ? res.status(200).send(query_res) : res.status(200).send({msg: "No match found"})
})


app.listen(process.env.PORT)