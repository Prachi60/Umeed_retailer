import { Request, Response } from "express";
import HeaderCategory from "../../../models/HeaderCategory";

// @desc    Get all header categories (Admin)
// @route   GET /api/v1/header-categories/admin
// @access  Private/Admin
export const getAdminHeaderCategories = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await HeaderCategory.find().sort({
      order: 1,
      createdAt: -1,
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get published header categories (Public)
// @route   GET /api/v1/header-categories
// @access  Public
export const getHeaderCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await HeaderCategory.find({ status: "Published" }).sort({
      order: 1,
      createdAt: -1,
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Create a header category
// @route   POST /api/v1/header-categories
// @access  Private/Admin
export const createHeaderCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      iconLibrary,
      iconName,
      relatedCategory,
      status,
      order,
      theme,
    } = req.body;

    // Check if category with this name already exists
    const nameExists = await HeaderCategory.findOne({ name });
    if (nameExists) {
      return res
        .status(400)
        .json({ message: "Header category with this name already exists" });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const categoryExists = await HeaderCategory.findOne({ slug });
    if (categoryExists) {
      return res
        .status(400)
        .json({ message: "A category with a similar name already exists (slug conflict)" });
    }

    const category = await HeaderCategory.create({
      name,
      iconLibrary,
      iconName,
      slug,
      theme: theme || "all",
      relatedCategory,
      status,
      order,
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update a header category
// @route   PUT /api/v1/header-categories/:id
// @access  Private/Admin
// @desc    Update a header category
// @route   PUT /api/v1/header-categories/:id
// @access  Private/Admin
export const updateHeaderCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      iconLibrary,
      iconName,
      relatedCategory,
      status,
      order,
      theme,
    } = req.body;
    const category = await HeaderCategory.findById(req.params.id);

    if (category) {
      // Check if name is being updated and if it's already taken
      if (name && name !== category.name) {
        const nameExists = await HeaderCategory.findOne({ name });
        if (nameExists) {
          return res
            .status(400)
            .json({ message: "Header category with this name already exists" });
        }
        
        // Update slug if name changes
        category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        
        // Check if new slug conflicts
        const slugExists = await HeaderCategory.findOne({ slug: category.slug, _id: { $ne: category._id } });
        if (slugExists) {
          return res
            .status(400)
            .json({ message: "A category with a similar name already exists (slug conflict)" });
        }
      }

      category.name = name || category.name;
      category.iconLibrary = iconLibrary || category.iconLibrary;
      category.iconName = iconName || category.iconName;
      category.theme = theme || category.theme;
      category.relatedCategory = relatedCategory; // Allow clearing it (undefined or null or empty string)
      category.status = status || category.status;
      category.order = order !== undefined ? order : category.order;

      const updatedCategory = await category.save();
      return res.json(updatedCategory);
    } else {
      return res.status(404).json({ message: "Header category not found" });
    }
  } catch (error: any) {
    console.error("Update Header Category Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Category with this slug/theme already exists" });
    }
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a header category
// @route   DELETE /api/v1/header-categories/:id
// @access  Private/Admin
export const deleteHeaderCategory = async (req: Request, res: Response) => {
  try {
    const category = await HeaderCategory.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      return res.json({ message: "Header category removed" });
    } else {
      return res.status(404).json({ message: "Header category not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
