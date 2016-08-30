// include packages
var express = require('express');
var fs = require('fs');
var _ = require('lodash');
var pg = require('pg');
var Sequelize = require('sequelize');
var bodyParser = require('body-parser');
var config = JSON.parse(fs.readFileSync('config.json'))

// create an http server
var app = express();
//create application parser
var urlEncodedParser = bodyParser.urlencoded({ extended: false })
//create application/json parser
//var jsonParser = bodyParser.json();


app.set('views', './views'); // specify the views directory
app.set('view engine', 'ejs');

// new Sequelize('database', 'username', 'password', options)
var sequelize = new Sequelize(config.database, config.username, config.password , {
  host: 'localhost',
  dialect: 'postgres'
});

var User = sequelize.define('users', {
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in the database
  },
  lastName: {
    type: Sequelize.STRING
  },
  birthday: {
    type: Sequelize.STRING
  }
});

var Post = sequelize.define('posts', {
  title: {
    type: Sequelize.STRING,
  },
  body: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATEONLY
  },
});

var Comment = sequelize.define('comments', {
  body: {
    type: Sequelize.STRING,
  },
  date: {
    type: Sequelize.STRING,
  },
});

Post.hasMany(Comment, {foreignKey: 'comment_id'})
Comment.belongsTo(Post);

User.sync()
Post.sync()
Comment.sync()


// checking for authentication
// app.use(function(req, res, next) {
//   if (req.query.password !== 'secret') {
//     res.send('cannot continue wrong password');
//   } else {
//     next();
//   }
// });

// handle incoming requests to the "/" endpoint
app.get('/', function (request, response) {
  Post
  .findAll()
  .then(function(posts) {
    response.render('index', { result: posts });
  })
});

app.get('/new-post', function(request, response) {
  response.render('new-form');
})



app.get('/posts.json', function (request, response) {
  Post.findAll()
  .then(function(posts) {
    response.json(posts);
  })
});
app.get('/posts/:id/edit', function(request, response) {
  Post
    .findById(request.params.id)
    .then(function(post){
      response.render('edit-form', {post: post})
    })
});
// define the /posts/:id page
app.get('/posts/:id', function(request, response, next) {
  Post.findById(request.params.id)
  .then(function(post) {
    response.render('post', { post: post });
  })
  .catch(function(error) {
    next(error);
  })
});

app.get('/posts', function(request, response) {
  Post.
  findAll({
    where: {
     title: request.query.title,
    }
  })
  .then(function(post) {
    response.render('search', { result: post })
  });
});


// handle blog post creation
app.post('/posts', urlEncodedParser, function(request, response) {
  Post.create({
    title: request.body.title,
    body: request.body.body,
    date: new Date(),
  }).then(function(){
    response.send('Post Created');
  });
});

app.post('/posts/:id/comments', urlEncodedParser, function(request, response) {
  Comment.create({
    body: request.body.body,
    date: new Date(),
  }).then(function(){
    response.send('Comment Added')
  });
});


app.post('/posts/:id/edit', urlEncodedParser, function(request, response) {

  Post.findById(request.params.id)
    .then(function(post){
      post.title = request.body.title;
      post.body = request.body.body;
      post.date = new Date();
      post.save()
        .then(function(){
          response.send('Post Edited!');
        })
      })
    });



app.delete('/posts/:id', function (request, response) {
  Post.destroy({
    where: {id:request.params.id}
  })
  .then(function(){
    response.send('Post Deleted');
  });
});
//other method
/*
Post.findById(request.params.id)
  .then(function(post){
      post.update({
      title: request.body.title,
      body: request.body.body,
      date: new Date(),
    })
  })
    .then(function(){
      response.send('Post Edited')
    });
});
*/
app.use(function(req, res, next) {
  res.status(404).send('page not found')
});

// listen for incoming requests
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
