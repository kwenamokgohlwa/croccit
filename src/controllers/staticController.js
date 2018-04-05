module.exports = {
  index(req, res, next){
    res.render("static/index.ejs");
  },
  about(req, res, next){
    res.render("static/about.ejs")
  }
}
