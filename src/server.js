const app = require("./app.js");
const http = require("http");
const server = http.createServer(app);

server.listen(3000);

server.on("listening", () => {
  console.log("server is listening for requests on port 3000")
});
