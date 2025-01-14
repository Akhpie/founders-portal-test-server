import express from "express";
import {
  createIncubatorCompanyHandler,
  deleteIncubatorCompanyHandler,
  getAdminIncubatorCompaniesHandler,
  getPublicIncubatorCompaniesHandler,
  getIncubatorCompanyByIdHandler,
  searchIncubatorCompaniesHandler,
  updateIncubatorCompanyHandler,
} from "../../controllers/incubator.controller";

const router = express.Router();

// Public routes
router.get("/incubator-companies", getPublicIncubatorCompaniesHandler);
router.get("/incubator-companies/search", searchIncubatorCompaniesHandler);
router.get("/incubator-companies/:id", getIncubatorCompanyByIdHandler);

// Admin routes
router.get("/admin/incubator-companies", getAdminIncubatorCompaniesHandler);
router.post("/admin/incubator-companies", createIncubatorCompanyHandler);
router.put("/admin/incubator-companies/:id", updateIncubatorCompanyHandler);
router.delete("/admin/incubator-companies/:id", deleteIncubatorCompanyHandler);

export default router;
