module.exports = {
  init(app){
    const staticRoutes = require("../routes/static.js");
    const topicRoutes = require("../routes/topics.js");
    const advertisementRoutes = require("../routes/advertisements.js")

    app.use(staticRoutes);
    app.use(topicRoutes);
    app.use(advertisementRoutes);
  }
}
