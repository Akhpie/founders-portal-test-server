import express, { Request, Response } from "express";
import Template from "../../models/Template";

const router = express.Router();

// Get all templates
const getAllTemplatesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    const templates = await Template.find(filter).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching templates",
    });
  }
};

// Save new template
const saveTemplateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, category, content, thumbnail } = req.body;

    // Check if name already exists
    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      res.status(400).json({
        success: false,
        message: "Template with this name already exists",
      });
      return;
    }

    const template = new Template({
      name,
      description,
      category,
      content,
      thumbnail,
      isDefault: false,
    });

    await template.save();
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving template",
    });
  }
};

// Clone template
const cloneTemplateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const sourceTemplate = await Template.findById(id);

    if (!sourceTemplate) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    const clonedTemplate = new Template({
      name: `${sourceTemplate.name} (Copy)`,
      description: sourceTemplate.description,
      category: sourceTemplate.category,
      content: sourceTemplate.content,
      thumbnail: sourceTemplate.thumbnail,
      isDefault: false,
    });

    await clonedTemplate.save();
    res.status(201).json({
      success: true,
      data: clonedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cloning template",
    });
  }
};

// Update template
const updateTemplateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    if (template.isDefault) {
      res.status(403).json({
        success: false,
        message: "Default templates cannot be modified",
      });
      return;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating template",
    });
  }
};

// Delete template
const deleteTemplateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    if (template.isDefault) {
      res.status(403).json({
        success: false,
        message: "Default templates cannot be deleted",
      });
      return;
    }

    await Template.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting template",
    });
  }
};

// Routes
router.get("/templates", getAllTemplatesHandler);
router.post("/templates", saveTemplateHandler);
router.post("/templates/:id/clone", cloneTemplateHandler);
router.put("/templates/:id", updateTemplateHandler);
router.delete("/templates/:id", deleteTemplateHandler);

export default router;
