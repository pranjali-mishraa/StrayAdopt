const ngoService = require("../services/ngo.service");
const postService = require("../services/post.service");

const fail = (res, error) =>
    res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });

async function getNgoProfileController(req, res) {
    try {
        const ngo = await ngoService.getVerifiedNgo(req.params.id);
        return res.status(200).json({ ngo });
    } catch (error) { return fail(res, error); }
}

async function getNgoPostsController(req, res) {
    try {
        await ngoService.getVerifiedNgo(req.params.id); // 404 unless verified
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const result = await postService.getPostsByOwner(req.params.id, { page, limit });
        return res.status(200).json(result);
    } catch (error) { return fail(res, error); }
}

async function getNgoHighlightsController(req, res) {
    try {
        const highlights = await ngoService.getPublicHighlights(req.params.id);
        return res.status(200).json({ highlights });
    } catch (error) { return fail(res, error); }
}

async function createHighlightController(req, res) {
    try {
        const highlight = await ngoService.createHighlight({
            ngoId: req.ngo._id,
            file: req.file,
            caption: req.body.caption,
            contentType: req.body.contentType,
        });
        return res.status(201).json({ message: "Published", highlight });
    } catch (error) { return fail(res, error); }
}

module.exports = {
    getNgoProfileController,
    getNgoPostsController,
    getNgoHighlightsController,
    createHighlightController,
};