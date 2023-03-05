var express = require('express');
var { Types } = require('mongoose');
var expressHbs = require('express-handlebars');
var path = require('path');

var app = express();
app.set('view engine', 'hbs');

app.use('/user', function(req, res, next) {
    app.engine('hbs', expressHbs.engine({
      layoutsDir: __dirname + '/views/user/layouts/',
      partialsDir: __dirname + '/views/user/partials/',
      defaultLayout: 'layout',
      extname: '.hbs'
    }));
    app.set('views', __dirname + '/views/user');
    next();
  });

app.use(express.urlencoded({extended:true}));

var url = 'mongodb+srv://Gundam:Tanghj23@gundam.uglqxca.mongodb.net/test';
var MongoClient = require('mongodb').MongoClient;

app.post('/edit',async (req,res)=>{
    const Name = req.body.txtName
    const Price = req.body.txtPrice
    const Image = req.body.Image
    const Quantity = req.body.Quantity
    const Type = req.body.Type
    const id = req.body.id

    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    const condition = {"_id" : new ObjectId(id)};
    const newValues = {$set : {Name:Name,Price:Price,Image:Image,Quantity:Quantity,Type:Type}}
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
    res.render('admin/edit',{prod:prod})
})

app.post('/add',async (req,res)=>{
    const Name = req.body.txtName
    const Price = req.body.txtPrice
    const Image = req.body.Image
    const Quantity = req.body.Quantity
    const Type = req.body.Type
    //kiem tra input
    if(Name.length <=5){
        res.render('admin/add',{Name_err: 'Min length is 5 characters'})
        return
    }
    //
    const newProduct = {
        'Name': Name,
        'Price':Price,
        'Image':Image,
        'Quantity':Quantity,
        'Type':Type
    }
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    await dbo.collection("product").insertOne(newProduct)
    res.redirect("/")

})

app.get('/add',(req,res)=>{
    res.render('admin/add')
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
    res.render('admin/main',{'product':products})
})

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server is up!")
})