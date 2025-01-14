import express from "express";
import {
  createSeedInvestorsHandler,
  deleteSeedInvestorsHandler,
  getAdminSeedInvestorsHandler,
  getSeedInvestorsByIdHandler,
  getPublicSeedInvestorsHandler,
  searchSeedInvestorsHandler,
  updateSeedInvestorsHandler,
} from "../../controllers/seed.controller";

const router = express.Router();

// Public routes
router.get("/seed-investors", getPublicSeedInvestorsHandler);
router.get("/seed-investors/search", searchSeedInvestorsHandler);
router.get("/seed-investors/:id", getSeedInvestorsByIdHandler);

// Admin routes
router.get("/admin/seed-investors", getAdminSeedInvestorsHandler);
router.post("/admin/seed-investors", createSeedInvestorsHandler);
router.put("/admin/seed-investors/:id", updateSeedInvestorsHandler);
router.delete("/admin/seed-investors/:id", deleteSeedInvestorsHandler);

export default router;
