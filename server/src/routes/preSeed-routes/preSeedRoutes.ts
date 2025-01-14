import express from "express";
import {
  createPreSeedInvestorsHandler,
  deletePreSeedInvestorsHandler,
  getAdminPreSeedInvestorsHandler,
  getPreSeedInvestorsByIdHandler,
  getPublicPreSeedInvestorsHandler,
  searchPreSeedInvestorsHandler,
  updatePreSeedInvestorsHandler,
} from "../../controllers/preSeed.Controller";

const router = express.Router();

// Public routes
router.get("/preseed-investors", getPublicPreSeedInvestorsHandler);
router.get("/preseed-investors/search", searchPreSeedInvestorsHandler);
router.get("/preseed-investors/:id", getPreSeedInvestorsByIdHandler);

// Admin routes
router.get("/admin/preseed-investors", getAdminPreSeedInvestorsHandler);
router.post("/admin/preseed-investors", createPreSeedInvestorsHandler);
router.put("/admin/preseed-investors/:id", updatePreSeedInvestorsHandler);
router.delete("/admin/preseed-investors/:id", deletePreSeedInvestorsHandler);

export default router;
