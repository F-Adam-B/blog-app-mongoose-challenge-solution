'use strict'
  
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');


// this makes the should syntax available throughout
// this module
const should = chai.should();

const{BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo

function seedBlogData() {
    console.info('seeding blog data');
    const seedData = [];
  
    for (let i=1; i<=10; i++) {
      seedData.push(generateBlogData());
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
  }


function generateBlogData() {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        }

    }
}

function tearDownDb() {
    console.warn('Deleting DB');
    return mongoose.connection.dropDatabase();
}

describe('Blogs API resource', function() {
    
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    
    beforeEach(function() {
        return seedBlogData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    })

    describe('GET endpoint', function() {
        it('should return all existing posts', function() {
            let res;
            return chai.request(app)
            .get('/posts')
            .then(function(_res) {
                res = _res;
                res.should.have.status(200);
                res.body.should.have.length.of.at.least(1);
                return BlogPost.count();
            })
            .then(function(count) {
                res.body.should.have.lengthOf(count);
            });
        });
        it('should return posts with right fields', function() {
            // Strategy: Get back all posts, and ensure they have expected keys
    
            let resBlogPosts;
            return chai.request(app)
            .get('/posts')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length.of.at.least(1);
    
                res.body.forEach(function(post) {
                post.should.be.a('object');
                post.should.include.keys('id','title', 'content', 'author');
                });
                resBlogPosts = res.body[0];
                return BlogPost.findById(resBlogPosts.id);
            })
            .then(function(post) {
                console.log('||||',resBlogPosts.author, post.author)
                resBlogPosts.id.should.equal(post.id);
                resBlogPosts.title.should.equal(post.title);
                resBlogPosts.content.should.equal(post.content);
                resBlogPosts.author.firstName.should.equal(post.author.firstName);
                resBlogPosts.author.lastName.should.equal(post.author.lastName);   
                });
        });
    })
    describe('POST endpoint', function() {
        // strategy: make a post request with data,
        // then prove that the post we get back has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)
        it('should add a new post', function() {
    
          const newPost = generateBlogData();
          
          return chai.request(app)
        //   console.log('||', res.body.content, newPost.content)
            .post('/posts')
            .send(newPost)
            .then(function(res) {
              res.should.have.status(201);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.include.keys('id', 'title', 'content', 'author');
              res.body.title.should.equal(newPost.title);
              // cause Mongo should have created id on insertion
              res.body.id.should.not.be.null;
              res.body.content.should.equal(newPost.content);
              res.body.author.firstName.should.equal(newPost.author.firstName);
              res.body.author.lastName.should.equal(newPost.author.lastName);
    
                  
             return BlogPost.findById(res.body.id);
            })
            .then(function(post) {
              post.title.should.equal(newPost.title);
              post.content.should.equal(newPost.content);
              post.author.firstName.should.equal(newPost.author.firstName);
              post.author.lastName.should.equal(newPost.author.lastName);
            //   post.id.should.equal(newPost.id);
           
            });
        });
      });
    describe('PUT endpoint', function() {
    
        // strategy:
        //  1. Get an existing posts from db
        //  2. Make a PUT request to update that posts
        //  3. Prove posts returned by request contains data we sent
        //  4. Prove posts in db is correctly updated
        it('should update fields you send over', function() {
            const updateData = {
            title: 'fofofofofofofof',
            content: 'futuristic fusion'
            };
    
            return BlogPost
            .findOne()
            .then(function(post) {
                updateData.id = post.id;
    
                // make request then inspect it to make sure it reflects
                // data we sent
                return chai.request(app)
                .put(`/posts/${post.id}`)
                .send(updateData);
            })
            .then(function(res) {
                res.should.have.status(204);
    
                return BlogPost.findById(updateData.id);
            })
            .then(function(post) {
                post.title.should.equal(updateData.title);
                post.content.should.equal(updateData.content);
            });
        });
    });
    describe('DELETE endpoint', function() {
        // strategy:
        //  1. get a restaurant
        //  2. make a DELETE request for that restaurant's id
        //  3. assert that response has right status code
        //  4. prove that restaurant with the id doesn't exist in db anymore
        it('delete a post by id', function() {
    
          let post;
    
          return BlogPost
            .findOne()
            .then(function(_post) {
              post = _post;
              return chai.request(app).delete(`/posts/${post.id}`);
            })
            .then(function(res) {
              res.should.have.status(204);
              return BlogPost.findById(post.id);
            })
            .then(function(_post) {
              // when a variable's value is null, chaining `should`
              // doesn't work. so `_restaurant.should.be.null` would raise
              // an error. `should.be.null(_restaurant)` is how we can
              // make assertions about a null value.
              should.not.exist(_post);
            });
        });
      });

})
