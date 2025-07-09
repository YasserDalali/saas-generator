import { Request, Response } from "express";

class UserController {
  static async getUsers(req: Request, res: Response) {
    res.send("respond with a resource");
  }
}

export default UserController;
