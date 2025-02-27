import { Request, Response } from "express";
import { ResourceCategory } from "../models/resourceSchema";

export const resourceController = {
  // Existing category methods
  getAllCategories: async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await ResourceCategory.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  createCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryData = {
        ...req.body,
        items: [], // Start with empty items array
      };
      const category = new ResourceCategory(categoryData);
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  updateCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const categoryData = {
        ...req.body,
        // Preserve existing items
        items: undefined,
      };

      const category = await ResourceCategory.findByIdAndUpdate(
        id,
        { $set: categoryData },
        { new: true }
      );

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await ResourceCategory.findByIdAndDelete(id);

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  addResource: async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;

      let resourceData;
      if (req.file) {
        // Handle local file upload
        resourceData = {
          name: req.body.name,
          fileType: req.body.fileType,
          rating: Number(req.body.rating),
          preview: req.body.preview === "true",
          downloads: 0,
          fileUrl: `/resuploads/${req.file.filename}`,
          fileSource: "local",
        };
      } else {
        // Handle Google Drive link
        resourceData = {
          name: req.body.name,
          fileType: req.body.fileType,
          rating: Number(req.body.rating),
          preview: req.body.preview, // Should be received as boolean
          downloads: 0,
          driveLink: req.body.driveLink,
          fileSource: "drive",
        };
      }

      const category = await ResourceCategory.findByIdAndUpdate(
        categoryId,
        {
          $push: {
            items: resourceData,
          },
        },
        { new: true }
      );

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      const newResource = category.items[category.items.length - 1];
      res.status(201).json(newResource);
    } catch (error) {
      console.error("Error adding resource:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateResource: async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId, resourceId } = req.params;
      let updateData: any = {
        "items.$.name": req.body.name,
        "items.$.fileType": req.body.fileType,
        "items.$.rating": Number(req.body.rating),
        "items.$.preview": req.body.preview === "true",
      };

      // Handle file update scenarios
      if (req.file) {
        updateData["items.$.fileUrl"] = `/resuploads/${req.file.filename}`;
        updateData["items.$.fileSource"] = "local";
        updateData["items.$.driveLink"] = null;
      } else if (req.body.driveLink) {
        updateData["items.$.driveLink"] = req.body.driveLink;
        updateData["items.$.fileSource"] = "drive";
        updateData["items.$.fileUrl"] = null;
      }

      const category = await ResourceCategory.findOneAndUpdate(
        {
          _id: categoryId,
          "items._id": resourceId,
        },
        {
          $set: updateData,
        },
        { new: true }
      );

      if (!category) {
        res.status(404).json({ message: "Category or resource not found" });
        return;
      }

      const updatedResource = category.items.find(
        (item) => item._id!.toString() === resourceId
      );

      res.json(updatedResource);
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteResource: async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId, resourceId } = req.params;

      const category = await ResourceCategory.findByIdAndUpdate(
        categoryId,
        {
          $pull: {
            items: { _id: resourceId },
          },
        },
        { new: true }
      );

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  incrementDownloads: async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId, resourceId } = req.params;

      const category = await ResourceCategory.findOneAndUpdate(
        {
          _id: categoryId,
          "items._id": resourceId,
        },
        {
          $inc: {
            "items.$.downloads": 1, // This will now work as downloads is a number
          },
        },
        { new: true }
      );

      if (!category) {
        res.status(404).json({ message: "Category or resource not found" });
        return;
      }

      const updatedResource = category.items.find(
        (item) => item._id!.toString() === resourceId
      );

      res.json({ downloads: updatedResource?.downloads });
    } catch (error) {
      console.error("Error incrementing downloads:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
