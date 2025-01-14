import express, { Request, RequestHandler, Response } from "express";
import StartupInfluencer from "../../models/StartupInfluencer";

const router = express.Router();

const getAllStartupInfluencers = async (_req: Request, res: Response) => {
  try {
    const startupinfluencers = await StartupInfluencer.find();
    res.json(startupinfluencers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Startup-influencers" });
  }
};

const createStartupInfluencer = async (req: Request, res: Response) => {
  try {
    const newStartupInfluencer = new StartupInfluencer(req.body);
    const savedStartupInfluencer = await newStartupInfluencer.save();
    res.status(201).json(savedStartupInfluencer);
  } catch (error) {
    res.status(400).json({ message: "Error creating startup-influencer" });
  }
};

const updateStartupInfluencer: RequestHandler = async (req, res, next) => {
  try {
    const updatedStartupInfluencer = await StartupInfluencer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStartupInfluencer) {
      res.status(404).json({ message: "startup-Influencer not found" });
      return;
    }
    res.json(updatedStartupInfluencer);
  } catch (error) {
    res.status(400).json({ message: "Error updating startup-influencer" });
  }
};

const deleteStartupInfluencer: RequestHandler = async (req, res, next) => {
  try {
    const deletedStartupInfluencer = await StartupInfluencer.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStartupInfluencer) {
      res.status(404).json({ message: "startup-Influencer not found" });
      return;
    }
    res.json({ message: "Startup-Influencer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting Startup-influencer" });
  }
};

// Routes
router.get("/", getAllStartupInfluencers);
router.post("/", createStartupInfluencer);
router.put("/:id", updateStartupInfluencer);
router.delete("/:id", deleteStartupInfluencer);

export default router;
