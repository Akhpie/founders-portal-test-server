import express, { Request, Response } from "express";
import { RequestHandler } from "express";
import { authenticateAdmin, isSuperAdmin } from "../../middleware/adminAuth";
import AdminUser from "../../models/AdminUser";

const router = express.Router();

// Get all admin users
const getAllAdmins: RequestHandler = async (req, res) => {
  try {
    console.log("User requesting admin list:", req.adminuser);
    const admins = await AdminUser.find({}).lean();
    console.log("Found admins:", admins);
    res.json(admins);
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    res.status(500).json({ error: "Failed to fetch admin users" });
  }
};

// Add new admin user
const createAdmin: RequestHandler = async (req, res) => {
  try {
    const { adminemail, adminname, adminrole, status } = req.body;
    const adminUser = await AdminUser.create({
      adminemail,
      adminname,
      adminrole,
      status,
      addedBy: req.adminuser?.adminemail,
      dateAdded: new Date(),
    });
    res.status(201).json(adminUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create admin user" });
  }
};

// Update admin user
const updateAdmin: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const adminUser = await AdminUser.findByIdAndUpdate(
      id,
      {
        adminemail: update.adminemail,
        adminname: update.adminname,
        adminrole: update.adminrole,
        status: update.status,
      },
      { new: true }
    );

    if (!adminUser) {
      res.status(404).json({ error: "Admin user not found" });
      return;
    }

    res.json(adminUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update admin user" });
  }
};

// Delete admin user
const deleteAdmin: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = await AdminUser.findById(id);

    if (!adminUser) {
      res.status(404).json({ error: "Admin user not found" });
      return;
    }

    if (adminUser.adminrole === "super_admin") {
      const superAdminCount = await AdminUser.countDocuments({
        adminrole: "super_admin",
      });
      if (superAdminCount <= 1) {
        res.status(400).json({ error: "Cannot delete the last super admin" });
        return;
      }
    }

    await AdminUser.findByIdAndDelete(id);
    res.json({ message: "Admin user deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin user" });
  }
};

// Route definitions
router.get("/admin-users", authenticateAdmin, getAllAdmins);
router.post("/admin-users", authenticateAdmin, isSuperAdmin, createAdmin);
router.put("/admin-users/:id", authenticateAdmin, isSuperAdmin, updateAdmin);
router.delete("/admin-users/:id", authenticateAdmin, isSuperAdmin, deleteAdmin);

export default router;
