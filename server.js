const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config.js');
require("dotenv").config();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());


mongoose.Promise = global.Promise;
mongoose.connect(config.url, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log("could not connect to the database. Exiting now...", err);
})
mongoose.set('useFindAndModify', false);
//============================================
  const users = require('./models/user.model');
  const chat = require('./models/chat.model');
//============================================

// ===========================================

require('./api/router/api.routes')(app, passport);


// ===========================================

//=========================================================
app.get('/', (req, res) => {
  console.log("========= 1 =========");
  console.log()
  // res.render('index', { rooms: rooms })
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if(req.session.user){
    res.redirect('/chatlist');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  if(req.body.username && req.body.password){
    users.findOne({"username": req.body.username}, function(err, foundUser){
      if(err) res.send(err);
      if(foundUser){
        console.log("================================")
        console.log(foundUser)
        if (foundUser.password === req.body.password){
          req.session.user = foundUser;
          console.log(foundUser);
          res.redirect('/chatlist');
        } else {
          res.send("wrong user or password");
        }
      } else {
        res.send("user not found");
      }
    })
  } else {
    res.send("cannot be empty");
  }
});

app.get('/signup', (req, res) => {
  if(req.session.user){
    res.redirect('/room');
  } else {
    res.render('signup');
  }
});

app.post('/signup', (req, res) => {
  users.findOne({"username":req.body.username}, function(err, found){
    if(err) res.send(err);
    else if(found) res.send('user already exist');

    if(!found){
        var user = new users();
        user.username = req.body.username;
        // user.password = user.generateHash(req.body.password);
        user.password = req.body.password;
        user.save(function(err, done){
          if(err){
            res.send(err);
          } else {
            console.log(done);
            res.redirect('/login');
          }
        })
    }
  })
})


app.get('/chatlist', (req, res) => {

  users.find(function(err, user){
    res.render('chatlist', {
      session: req.session.user,
      chatList: user
    })
  })
})

app.get('/chatbox/:id', (req, res) => {
  // if (rooms[req.params.room] == null) {
  //   console.log("========= 5 =========");
  //   console.log(rooms[req.body.room]);
  //   return res.redirect('/')
  // }
  chat.findOne(
    { $or: [
      {userOne: req.session.user._id, userTwo: req.params.id},
      {userOne: req.params.id, userTwo: req.session.user._id}
    ]}, function(err, foundThread){
      if(err){
        res.send(err);
      } else if(!foundThread){
        var thread = new chat();
        thread.userOne = req.session.user._id,
        thread.userTwo = req.params.id
        thread.save(function(err, createdThread){
          if(err){
            res.send(err);
          } else {
            res.redirect('/chat/'+ createdThread._id);
          }
        });
      } else if(foundThread){
        res.redirect('/chat/'+ foundThread._id);
      } else {
        res.send("something went wrong");
      }
  })
})

app.get('/chat/:id', (req, res) => {

  chat.findOne({"_id": req.params.id, $or: [{userOne: req.session.user._id},{ userTwo: req.session.user._id}]},function(err, chatId){
    if(err){
      res.send(err);
    } else if(chatId){
      res.render('room', {
        roomName: req.params.id,
        session: req.session.user,
        chat: chatId
      });
    } else {
      res.send('chat room not found');
    }
  })


})

app.post('/chat/:id', (req, res) => {

  console.log(res);
})


// =============================================================
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");
const botName = "vishal";
io.on('connection', socket => {
  console.log("connected with io")
  socket.on('joinRoom', ({ user_id, username, conversation_id }) => {
    const user = userJoin(socket.id, user_id, username, conversation_id);
    socket.join(user.room);

    // welcome current user
    // socket.emit('message', formatMessage(botName, 'welcome to Chat'));

    // Broadcast when a user connects
    // socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined`));

    // Send users and  room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

  });

  // Listen for ChatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    var data = formatMessage(user.user_id, user.username, msg);
    console.log(data);
    chat.findByIdAndUpdate(user.room, { $push: { chat: data } }, {new: true}, function(err){
      if(err){
        console.log(err);
      }
    });
    io.to(user.room).emit('message', formatMessage(user.user_id, user.username, msg));
  });

  // Run when client disconnects
  socket.on('disconnect', () =>{
    const user = userLeave(socket.id);

    if(user){
      io.to(user.room).emit(
        'message',
        formatMessage(user.username, `${user.username} has left the chat`)
      );

      // Send users and  room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });

    }
  });
});

// =============================================================


server.listen(process.env.PORT || config.serverport, function(){
  console.log('server is working ', config.serverport);
})