const asUser = (req, res, next) => {
    req.postOwner = { id: req.user._id, model: "User" };
    next();
};

const asNgo = (req, res, next) => {
    req.postOwner = { id: req.ngo._id, model: "Ngo" };
    next();
};

module.exports = { asUser, asNgo };