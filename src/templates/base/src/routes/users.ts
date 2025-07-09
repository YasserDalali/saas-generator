import { Router } from "express";
import UserController from "../controller/user.controller";

const userRouter = Router();

//? GET users listing.
userRouter.get("/", UserController.getUsers);

export default userRouter;
