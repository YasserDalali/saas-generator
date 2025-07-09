import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import usersRouter from "./routes/users";
import chalk from "chalk";
import arcjetMiddleware from "./middleware/arcjet";

const app = express();

//? Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware());
//? Routes
app.use("/users", usersRouter);

app.listen(3000, () => {
  console.log(chalk.bgGreen.white.bold("Server is running on port 3000"));
});

export default app;
