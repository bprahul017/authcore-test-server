import express from "express";
import router from "./routes/router";
import { authConfig } from "./config/auth.config";
import './config/env.config'

const port = 4000;
const server = express();

server.use(authConfig);
server.use("/", router);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
