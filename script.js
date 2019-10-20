var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
var port = process.env.PORT || 80

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


var dbUrl = 'mongodb+srv://user:user@cluster0-ujgb0.mongodb.net/test?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message:String
})

// let Message = {
//     name: String,
//     message: String
// }


var messages = [
]

Message.find((err, message) => {
    if (err) return handleError(err);
    
    else
        message.forEach(element => {
            //messages.push(element)
            messages.push({name: element.name, message: element.message})
        });  
  })
  

app.all('/messages', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "localhost:80");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

app.get('/messages', (req, res) =>{
    res.send(messages)
})

app.post('/messages', (req, res) =>{
    var message = new Message(req.body)

    message.save((err) => {
        if (err)
            sendStatus(500)
    
        messages.push(req.body)
        io.emit('message', req.body)
        res.sendStatus(200)
    })
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) =>{
    console.log('mongo db connection', err)
})

var server = http.listen(port, () => {
    console.log("port is listening on port",  server.address().port)
})
