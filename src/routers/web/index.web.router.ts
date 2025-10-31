import { Router } from "express";
import webAuthRouter from "./auth.web.router";
import webAccountRouter from "./account.web.router";
import noteService from "../../services/notes.service";
import { requireLogin } from "../../middlewares/web-auth";

const webRouter = Router();

webRouter.get("/", requireLogin, async (req, res) => {
    const notes = await noteService.getAllNotes(req.user!.id);
    return res.render("home", {
        title: "Home",
        user: req.user,  
        notes
    });
});

webRouter.use("/", webAuthRouter); 
webRouter.use("/", webAccountRouter);

export default webRouter;