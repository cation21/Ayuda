import express from "express";

const router = express.Router();

// TODO: signup, login, logout, refresh — this is the highest-priority
// slice to build next, since Post/Donation/Verification all depend on
// having a User to attach to.
router.get("/", (req, res) => res.json({ module: "auth", status: "scaffolded" }));

export default router;
