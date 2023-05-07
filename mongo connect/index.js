// const express=require("express");
// const mongoose=require("mongoose");
// const app = express()
// mongoose.connect("mongodb://localhost:27017/Haleel",{
//     useNewUrlParser:true,useUnifiedTopology:true
// },(err)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log("Succesfully Connected")
//     }
// })

// app.listen(3000,()=>{
//     console.log("on port 3000 !!!")
// })



const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017/Haleel";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Succesfully Connected');
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();