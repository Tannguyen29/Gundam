var express = require('express');
var app = express()

app.set('view engine','hbs')
app.use(express.urlencoded({extended:true}))

var url = 'mongodb+srv://Gundam:Tanghj23@gundam.uglqxca.mongodb.net/test';
var MongoClient = require('mongodb').MongoClient;

app.post('/edit',async (req,res)=>{
    const name = req.body.txtName
    const price = req.body.txtPrice
    const Image = req.body.Image
    const id = req.body.id

    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    const condition = {"_id" : new ObjectId(id)};
    const newValues = {$set : {name:name,price:price,Image:Image}}
    await dbo.collection("product").updateOne(condition,newValues)
    res.redirect('/')
})

app.get('/edit/:id', async(req,res)=>{
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = {"_id" : new ObjectId(id)};
    const prod = await dbo.collection("product").findOne(condition)
    res.render('edit',{prod:prod})
})

app.post('/add',async (req,res)=>{
    const name = req.body.txtName
    const price = req.body.txtPrice
    const Image = req.body.Image
    //kiem tra input
    if(name.length <=5){
        res.render('add',{name_err: 'Min length is 5 characters'})
        return
    }
    //
    const newProduct = {
        'name': name,
        'price':price,
        'Image':Image
    }
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    await dbo.collection("product").insertOne(newProduct)
    res.redirect("/")

})

app.get('/add',(req,res)=>{
    res.render('add')
})
app.get('/delete/:id',async (req,res)=>{
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = {"_id" : new ObjectId(id)};
    await dbo.collection("product").deleteOne(condition)
    res.redirect("/")
})

app.get('/',async (req,res)=>{
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    let products = await dbo.collection("product").find().toArray()
    res.render('main',{'product':products})
})

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server is up!")
})