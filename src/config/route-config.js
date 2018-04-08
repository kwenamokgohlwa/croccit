module.exports = {
  init(app){
    const staticRoutes = require("../routes/static.js");
    const topicRoutes = require("../routes/topics.js");
    const postRoutes = require("../routes/posts.js");
    const flairRoutes = require("../routes/flairs.js");

    app.use(staticRoutes);
    app.use(topicRoutes);
    app.use(postRoutes);
    app.use(flairRoutes);
  }
}
