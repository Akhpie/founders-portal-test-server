import express from "express";
import multer from "multer";
import { multerConfig } from "../../config/multerConfig";
import { resourceController } from "../../controllers/resourceController";

const router = express.Router();
const upload = multer(multerConfig);

// Route constants
const ROUTES = {
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: "/categories/:id",
  RESOURCES: "/categories/:categoryId/resources",
  RESOURCE_BY_ID: "/categories/:categoryId/resources/:resourceId",
  INCREMENT_DOWNLOADS:
    "/categories/:categoryId/resources/:resourceId/downloads",
} as const;

// Category routes
router.get(ROUTES.CATEGORIES, resourceController.getAllCategories);
router.post(ROUTES.CATEGORIES, resourceController.createCategory);
router.put(ROUTES.CATEGORY_BY_ID, resourceController.updateCategory);
router.delete(ROUTES.CATEGORY_BY_ID, resourceController.deleteCategory);

// Resource routes
router.post(
  ROUTES.RESOURCES,
  upload.single("file"),
  resourceController.addResource
);

router.put(
  ROUTES.RESOURCE_BY_ID,
  upload.single("file"),
  resourceController.updateResource
);

router.delete(ROUTES.RESOURCE_BY_ID, resourceController.deleteResource);

// Download tracking
router.post(ROUTES.INCREMENT_DOWNLOADS, resourceController.incrementDownloads);

export default router;
