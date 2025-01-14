import express, { Request, RequestHandler, Response } from "express";
import Influencers from "../../models/Influencers";

const router = express.Router();

const getAllInfluencers = async (_req: Request, res: Response) => {
  try {
    const influencers = await Influencers.find();
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching influencers" });
  }
};

const createInfluencer = async (req: Request, res: Response) => {
  try {
    const newInfluencer = new Influencers(req.body);
    const savedInfluencer = await newInfluencer.save();
    res.status(201).json(savedInfluencer);
  } catch (error) {
    res.status(400).json({ message: "Error creating influencer" });
  }
};

const updateInfluencer: RequestHandler = async (req, res, next) => {
  try {
    const updatedInfluencer = await Influencers.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInfluencer) {
      res.status(404).json({ message: "Influencer not found" });
      return;
    }
    res.json(updatedInfluencer);
  } catch (error) {
    res.status(400).json({ message: "Error updating influencer" });
  }
};

const deleteInfluencer: RequestHandler = async (req, res, next) => {
  try {
    const deletedInfluencer = await Influencers.findByIdAndDelete(
      req.params.id
    );
    if (!deletedInfluencer) {
      res.status(404).json({ message: "Influencer not found" });
      return;
    }
    res.json({ message: "Influencer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting influencer" });
  }
};

// Routes
router.get("/", getAllInfluencers);
router.post("/", createInfluencer);
router.put("/:id", updateInfluencer);
router.delete("/:id", deleteInfluencer);

export default router;
