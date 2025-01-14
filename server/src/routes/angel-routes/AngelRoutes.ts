import express from "express";
import {
  createAngelInvestorsHandler,
  deleteAngelInvestorsHandler,
  getAdminAngelInvestorsHandler,
  getAngelInvestorsByIdHandler,
  getPublicAngelInvestorsHandler,
  searchAngelInvestorsHandler,
  updateAngelInvestorsHandler,
} from "../../controllers/angel.controller";

const router = express.Router();

// Public routes
router.get("/angel-investors", getPublicAngelInvestorsHandler);
router.get("/angel-investors/search", searchAngelInvestorsHandler);
router.get("/angel-investors/:id", getAngelInvestorsByIdHandler);

// Admin routes
router.get("/admin/angel-investors", getAdminAngelInvestorsHandler);
router.post("/admin/angel-investors", createAngelInvestorsHandler);
router.put("/admin/angel-investors/:id", updateAngelInvestorsHandler);
router.delete("/admin/angel-investors/:id", deleteAngelInvestorsHandler);

export default router;
