// include packages
var express = require('express');
var fs = require('fs');
var _ = require('lodash');


// create an http server
var app = express();

app.set('views', './views'); // specify the views directory
app.set('view engine', 'ejs');



var pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'postgres', //env var: PGUSER
  database: 'postgres', //env var: PGDATABASE
  // password: 'secret', //env var: PGPASSWORD
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};


//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('select * from users', function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0]);
    //output: 1
  });
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})




// checking for authentication
// app.use(function(req, res, next) {
//   if (req.query.password !== 'secret') {
//     res.send('cannot continue wrong password');
//   } else {
//     next();
//   }
// });

var getPosts = function(id) {
  var data = JSON.parse(fs.readFileSync('db.json').toString());
  if (id === undefined) {
    return data.posts;
  }
  for (i in data.posts) {
    if (data.posts[i].id === id) {
      return data.posts[i];
    }
  }
};

// var editPost = function(post) {
//   var oldPost = getPost(post.id);
//   Object.assign({}, oldPost, post);
//   var data = JSON.parse(fs.readFileSync('db.json').toString());
//
// };

// handle incoming requests to the "/" endpoint
app.get('/', function (request, response) {
  response.render('index')
  // fs.readFile('index.html', function(error, html) {
  //   var template = _.template(html);
  //   var posts = getPosts();
  //   var generated = template({ posts: posts });
  //   response.send(generated);
  // });
});

// define the /posts/:id page
app.get('/posts/:id', function(request, response) {
  var html = fs.readFileSync('post.html').toString();
  var template = _.template(html);
  var post = getPosts(parseInt(request.params.id));
  var generated = template({ post: post });
  response.send(generated);
});

// handle blog post creation
app.post('/posts', function(request, response) {
  response.send('post created!');
});

app.use(function(req, res, next) {
  res.status(404).send('page not found')
});

// listen for incoming requests
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
