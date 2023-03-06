var express = require('express');
const { Types } = require('mongoose');
var expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();
var app = express()


app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

var url = 'mongodb+srv://Gundam:Tanghj23@gundam.uglqxca.mongodb.net/test';
var MongoClient = require('mongodb').MongoClient;

// LOGIN
app.get('/adminlogin', function (req, res) {
    res.render('login/login_form');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    let client = await MongoClient.connect(url)
    const db = client.db("Gundam_store");

    const user = await db.collection('users').findOne({ email });

    if (!user) {

        return res.status(401).send('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).send('Invalid password');
    }
    res.redirect("/admin");

});


//REGISTER
app.get('/register', function (req, res) {
    res.render('login/register_form');
});

app.post('/register', async (req, res) => {
    
    const { name, email, phone, password, password2 } = req.body;
    
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new document
        const newUser = {
            name,
            email,
            phone,
            password: hashedPassword
        };

        // Insert the new user document into the users collection
        let client = await MongoClient.connect(url)
        const db = client.db("Gundam_store");
        await db.collection("users").insertOne(newUser);
        res.redirect("/");
    
});

//Product Detail
app.get('/detail/:id', async (req, res) => {
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    const prod = await dbo.collection("product").findOne(condition)
    let products = await dbo.collection("product").find().toArray()
    res.render('user/detail', { prod: prod })
})

//add to cart
app.post('/detail', async (req, res) => {
    const { id, quantity} = req.body;
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    const prod = await dbo.collection("product").findOne(condition)

    if(prod.Quantity < quantity){
        res.render('user/detail', { prod: prod, err: "Quantity is not enough" })
        return
    }

    prod.totalPrice = prod.Price * quantity
    prod.buyQuantity = quantity;
    res.render('user/cart', { prod: prod })
})

app.get('/checkout', async (req, res) => {
    const { id, quantity} = req.query;
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    const prod = await dbo.collection("product").findOne(condition)

    if(prod.Quantity < quantity){
        res.render('user/detail', { prod: prod, err: "Quantity is not enough" })
        return
    }

    prod.totalPrice = prod.Price * quantity
    prod.buyQuantity = quantity;
    res.render('user/cart', { prod: prod })
})

app.post('/checkout', async (req, res) => {
    const { id, quantity} = req.body;
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    const prod = await dbo.collection("product").findOne(condition)
    const newQuantity = Number(prod.Quantity)- quantity
    const newValues = { $set: { Name: prod.Name, Price: prod.Price, Image: prod.Image, Quantity: newQuantity, Type: prod.Type } }
    await dbo.collection("product").updateOne(condition, newValues)

    res.render('user/checkout', { prod: prod })
})


//ADMIN
app.get('/admin', async (req, res) => {
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    let products = await dbo.collection("product").find().toArray()
    res.render('admin/main', { 'product': products })
})

app.post('/edit', async (req, res) => {
    const Name = req.body.txtName
    const Price = req.body.txtPrice
    const Image = req.body.Image
    const Quantity = req.body.Quantity
    const Type = req.body.Type
    const id = req.body.id

    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    const condition = { "_id": new ObjectId(id) };
    const newValues = { $set: { Name: Name, Price: Price, Image: Image, Quantity: Quantity, Type: Type } }
    await dbo.collection("product").updateOne(condition, newValues)
    res.redirect('/admin')
})

app.get('/edit/:id', async (req, res) => {
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    const prod = await dbo.collection("product").findOne(condition)
    res.render('admin/edit', { prod: prod })
})

app.post('/add', async (req, res) => {
    const Name = req.body.txtName
    const Price = req.body.txtPrice
    const Image = req.body.Image
    const Quantity = req.body.Quantity
    const Type = req.body.Type
    //kiem tra input
    if (Name.length <= 5) {
        res.render('admin/add', { Name_err: 'Min length is 5 characters' })
        return
    }
    //
    const newProduct = {
        'Name': Name,
        'Price': Price,
        'Image': Image,
        'Quantity': Quantity,
        'Type': Type
    }
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    await dbo.collection("product").insertOne(newProduct)
    res.redirect("/admin")

})

app.get('/add', (req, res) => {
    res.render('admin/add')
})
app.get('/delete/:id', async (req, res) => {
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    await dbo.collection("product").deleteOne(condition)
    res.redirect("/admin")
})

//USER
app.get('/', async (req, res) => {
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    let products = await dbo.collection("product").find().toArray()
    res.render('user/index', { 'product': products })
})
//USER MANAGER
app.get('/usermanager', async (req, res) => {
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    let user = await dbo.collection("users").find().toArray()
    res.render('admin/Admin_User', { 'users': user })
})

app.get('/usermanager/delete/:id', async (req, res) => {
    const id = req.params.id
    let client = await MongoClient.connect(url)
    let dbo = client.db("Gundam_store")
    var ObjectId = require('mongodb').ObjectId
    let condition = { "_id": new ObjectId(id) };
    await dbo.collection("users").deleteOne(condition)
    res.redirect("/usermanager")
})

//CONNECT 
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Server is up!")
})
