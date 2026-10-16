const { Router } = require("express");
const ngoAuthController = require("../controllers/ngoAuth.controller");
const ngoController = require("../controllers/ngo.controller");
const postController = require("../controllers/post.controller");
const { protectNgo, requireVerifiedNgo } = require("../middlewares/ngoAuth.middleware");
const { asNgo } = require("../middlewares/postOwner.middleware");
const upload = require("../middlewares/multer.middleware");
const { registrationUpload, highlightUpload } = require("../middlewares/ngoUpload.middleware");

const ngoRouter = Router();
const ngoWrite = [protectNgo, requireVerifiedNgo, asNgo]; // verified NGOs only

// Auth
ngoRouter.post("/register", registrationUpload, ngoAuthController.registerNgoController);
ngoRouter.post("/login", ngoAuthController.loginNgoController);
ngoRouter.post("/logout", protectNgo, ngoAuthController.logoutNgoController);
ngoRouter.get("/me", protectNgo, ngoAuthController.getNgoMeController);

// Highlights and stories
ngoRouter.post("/highlights", protectNgo, requireVerifiedNgo, highlightUpload, ngoController.createHighlightController);

// Adoption posts: same controllers as users, different auth chain
ngoRouter.post("/posts", ...ngoWrite, upload.array("images", 5), postController.createPostController);
ngoRouter.get("/posts/mine", protectNgo, asNgo, postController.getMyPostsController);
ngoRouter.patch("/posts/:id/description", ...ngoWrite, postController.updateDescriptionController);
ngoRouter.patch("/posts/:id/location", ...ngoWrite, postController.updateLocationController);
ngoRouter.patch("/posts/:id/images", ...ngoWrite, upload.array("images", 5), postController.updateImagesController);
ngoRouter.patch("/posts/:id/status", ...ngoWrite, postController.toggleAdoptedStatusController);
ngoRouter.delete("/posts/:id", ...ngoWrite, postController.deletePostController);

// Public: keep these after the fixed paths above
ngoRouter.get("/:id", ngoController.getNgoProfileController);
ngoRouter.get("/:id/posts", ngoController.getNgoPostsController);
ngoRouter.get("/:id/highlights", ngoController.getNgoHighlightsController);

module.exports = ngoRouter;