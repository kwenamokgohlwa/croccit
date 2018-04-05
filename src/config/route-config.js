module.exports = {
  init(app){
    const staticRoutes = require("../routes/static.js");
    const topicRoutes = require("../routes/topics.js");

    app.use(staticRoutes);
    app.use(topicRoutes);
  }
}
