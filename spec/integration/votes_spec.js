// #1
const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("routes : votes", () => {

  beforeEach((done) => {

    this.user;
    this.topic;
    this.post;
    this.vote;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((res) => {
        this.user = res;

        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",
        })
        .then((res) => {
          this.topic = res;

          Post.create({
            title: "My first visit to Proxima Centauri b",
            body: "I saw some rocks.",
            userId: this.user.id,
            topicId: this.topic.id,
            votes: [{
              value: 1,
              userId: this.user.id,
            }]
          }, {
            include: {
              model: Vote,
              as: "votes"
            }
          })
          .then((res) => {
            this.post = res;
            this.vote = this.post.votes[0];
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });

  //Guests
  describe("guest attempting to vote on a post", () => {

    beforeEach((done) => {    // before each suite in this context
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          userId: 0 // ensure no user in scope
        }
      },
        (err, res, body) => {
          done();
        }
      );

    });

    describe("GET /topics/:topicId/posts/:postId/votes/upvote", () => {

      it("should not create a new vote", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        let valueBeforeAttemptNew = this.vote.value;
        request.get(options,
          (err, res, body) => {
            Vote.findOne({            // look for the vote, should not find one.
              where: {
                userId: 0,
                postId: this.post.id
              }
            })
            .then((vote) => {
              expect(vote).toBeNull();
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });

    });
  });

//Members

  describe("signed in user voting on a post", () => {

    beforeEach((done) => {  // before each suite in this context
      request.get({         // mock authentication
        url: "http://localhost:3000/auth/fake",
        form: {
          role: "member",     // mock authenticate as member user
          userId: this.user.id
        }
      },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("GET /topics/:topicId/posts/:postId/votes/upvote", () => {

      it("should create an upvote", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {               // confirm that an upvote was created
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });

      it("should not create an upvote greater than 1", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
          value: 2
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                value: 2,
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {               // confirm that an upvote was created
              expect(vote).toBeNull();
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });

      it("should not create more than 1 vote per user", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {     // confirm that a upvote was created
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
            })
            .then(() => {
              request.get(options, (err, res, body) => {
                Vote.findOne({
                  where: {
                    userId: this.user.id,
                    postId: this.post.id
                  }
                })
                .then((vote) => {     // confirm that a upvote was created
                  expect(vote).not.toBeNull();
                  expect(vote.value).toBe(1);  // vote value stays the same
                  expect(vote.userId).toBe(this.user.id);
                  expect(vote.postId).toBe(this.post.id);
                  done();
                })
                .catch((err) => {
                  console.log(err);
                  done();
                });
              });
            });
          }
        );
      });

    });

    describe("GET /topics/:topicId/posts/:postId/votes/downvote", () => {

      it("should create a downvote", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {               // confirm that a downvote was created
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(-1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });

      it("should not create an upvote greater than 1", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`,
          value: -2
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                value: -2,
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {               // confirm that a downvote was created
              expect(vote).toBeNull();
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });

      it("should not create more than 1 downvote per user", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`,
        };
        request.get(options,
          (err, res, body) => {
            Vote.findOne({
              where: {
                userId: this.user.id,
                postId: this.post.id
              }
            })
            .then((vote) => {     // confirm that a downvote was created
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(-1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
            })
            .then(() => {
              request.get(options, (err, res, body) => {
                Vote.findOne({
                  where: {
                    userId: this.user.id,
                    postId: this.post.id
                  }
                })
                .then((vote) => {     // confirm that a downvote was created
                  expect(vote).not.toBeNull();
                  expect(vote.value).toBe(-1);  // vote value stays the same
                  expect(vote.userId).toBe(this.user.id);
                  expect(vote.postId).toBe(this.post.id);
                  done();
                })
                .catch((err) => {
                  console.log(err);
                  done();
                });
              });
            });
          }
        );
      });

    });

    describe("#getPoints()", () => {

      it("should get vote points", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
        };
        request.get(options,
          (err, res, body) => {
              expect(this.post.getPoints()).toBe(1); //calculates vote points
              done();
            })
          });

    });

    describe("#hasUpvoteFor()", () => {

      it("return true if user with matching userId has an upvote for the post", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
        };
        request.get(options,
          (err, res, body) => {
            expect(this.post.hasUpvoteFor(this.user.id)).toBeTruthy(); //checks whether user has an upvote for post
            done();
          }
        );
      });

    });

    describe("#hasDownvoteFor()", () => {

      it("return false if user with matching userId has does not have downvote", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`,
        };
        request.get(options,
          (err, res, body) => {
            expect(this.post.hasDownvoteFor(this.vote.userId)).not.toBeTruthy(); //checks whether the user has a downvote for post
            done();
          }
        );
      });

    });

  }); //end context for signed in user



});
