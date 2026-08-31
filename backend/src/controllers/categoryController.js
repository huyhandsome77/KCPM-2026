const { Category, Product } = require('../models');
const { Op } = require('sequelize');

exports.getAllCategories = async (req, res) => {
    try {
        const { search } = req.query;
        let where = {};

        if (search && typeof search === 'string' && search.trim() !== '') {
            where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search.trim()}%` } },
                    { description: { [Op.like]: `%${search.trim()}%` } }
                ]
            };
        }

        const categories = await Category.findAll({
            where,
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id']
            }]
        });

        // Map to include product count
        const result = categories.map(cat => {
            const data = typeof cat.toJSON === 'function' ? cat.toJSON() : { ...cat };
            data.productCount = data.products ? data.products.length : 0;
            delete data.products;
            return data;
        });

        res.json(result);
    } catch (error) {
        console.error("Get All Categories Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: "Not found" });
        res.json(category);
    } catch (error) {
        console.error("Get Category By Id Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body || {};

        if (name === undefined || name === null || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: "Category name is required and cannot be empty" });
        }

        if (name.length > 100) {
            return res.status(400).json({ message: "Category name cannot exceed 100 characters" });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description !== undefined ? description : null,
            image: image !== undefined ? image : null
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const { name, description, image } = req.body || {};

        if (name !== undefined) {
            if (name === null || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ message: "Category name cannot be empty" });
            }
            if (name.length > 100) {
                return res.status(400).json({ message: "Category name cannot exceed 100 characters" });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;

        const [updated] = await Category.update(updateData, {
            where: { id }
        });
        if (!updated) return res.status(404).json({ message: "Not found" });
        const updatedCategory = await Category.findByPk(id);
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const deleted = await Category.destroy({
            where: { id }
        });
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.status(204).send();
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: error.message });
    }
};
