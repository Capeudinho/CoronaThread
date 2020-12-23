const {Router} = require ("express");

const UserController = require ("./controllers/UserController");
const PostController = require ("./controllers/PostController");
const CommentController = require ("./controllers/CommentController");

const routes = Router ();

routes.get ("/userlist", UserController.list);
routes.get ("/useridindex", UserController.idindex);
routes.get ("/userloginindex", UserController.loginindex);
routes.post ("/userstore", UserController.store);
routes.put ("/useridupdate", UserController.idupdate);
routes.put ("/useridupdatedeactivate", UserController.idupdatedeactivate);
routes.delete ("/useriddestroy", UserController.iddestroy);

routes.get ("/postlist", PostController.list);
routes.get ("/postlistpag", PostController.listpag);
routes.get ("/postidindex", PostController.idindex);
routes.post ("/poststore", PostController.store);
routes.put ("/postidupdate", PostController.idupdate);
routes.put ("/postidupdateedit", PostController.idupdateedit);
routes.put ("/postidupdatevote", PostController.idupdatevote);
routes.delete ("/postiddestroy", PostController.iddestroy);

routes.get ("/commentlist", CommentController.list);
routes.get ("/commentlistpag", CommentController.listpag);
routes.get ("/commentidindex", CommentController.idindex);
routes.post ("/commentstore", CommentController.store);
routes.put ("/commentidupdate", CommentController.idupdate);
routes.put ("/commentidupdateedit", CommentController.idupdateedit);
routes.put ("/commentidupdatevote", CommentController.idupdatevote);
routes.delete ("/commentiddestroy", CommentController.iddestroy);

module.exports = routes;