import { app } from "./server";

app.use("/", (req, res) => {
  console.log(req);
});
