const { Product } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

exports.getAllProducts = async (req, res) => {
  try {
    const { category_id, search } = req.query;
    const where = {};
    if (category_id !== undefined && category_id !== '') {
      where.category_id = category_id;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.name = { [Op.like]: `%${search.trim()}%` };
    }
    const products = await Product.findAll({ where });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock, isAvailable, category_id } = req.body || {};

    // Validate Name (Min 1, Max 150 chars)
    if (name === undefined || name === null || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Product name is required and cannot be empty" });
    }
    if (name.length > 150) {
      return res.status(400).json({ message: "Product name cannot exceed 150 characters" });
    }

    // Validate Price (Min 0, Max 99,999,999.99)
    if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
      return res.status(400).json({ message: "Price is required and must be a valid number" });
    }
    const numPrice = Number(price);
    if (numPrice < 0 || numPrice > 99999999.99) {
      return res.status(400).json({ message: "Price must be between 0 and 99,999,999.99" });
    }

    // Validate Stock (Integer, Min 0, Max 2,147,483,647)
    let parsedStock = 0;
    if (stock !== undefined && stock !== null) {
      const numStock = Number(stock);
      if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0 || numStock > 2147483647) {
        return res.status(400).json({ message: "Stock must be an integer between 0 and 2,147,483,647" });
      }
      parsedStock = numStock;
    }

    // Validate Category ID (Integer >= 1)
    if (category_id === undefined || category_id === null || isNaN(Number(category_id))) {
      return res.status(400).json({ message: "Category ID is required and must be a valid number" });
    }
    const numCatId = Number(category_id);
    if (numCatId <= 0 || !Number.isInteger(numCatId)) {
      return res.status(400).json({ message: "Category ID must be a positive integer" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description !== undefined ? description : null,
      price: numPrice,
      image: image !== undefined ? image : null,
      stock: parsedStock,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      category_id: numCatId
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { name, description, price, image, stock, isAvailable, category_id } = req.body || {};
    const updateData = {};

    if (name !== undefined) {
      if (name === null || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: "Product name cannot be empty" });
      }
      if (name.length > 150) {
        return res.status(400).json({ message: "Product name cannot exceed 150 characters" });
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      if (price === null || price === '' || isNaN(Number(price))) {
        return res.status(400).json({ message: "Price must be a valid number" });
      }
      const numPrice = Number(price);
      if (numPrice < 0 || numPrice > 99999999.99) {
        return res.status(400).json({ message: "Price must be between 0 and 99,999,999.99" });
      }
      updateData.price = numPrice;
    }

    if (stock !== undefined) {
      if (stock === null || isNaN(Number(stock))) {
        return res.status(400).json({ message: "Stock must be a valid number" });
      }
      const numStock = Number(stock);
      if (!Number.isInteger(numStock) || numStock < 0 || numStock > 2147483647) {
        return res.status(400).json({ message: "Stock must be an integer between 0 and 2,147,483,647" });
      }
      updateData.stock = numStock;
    }

    if (category_id !== undefined) {
      if (category_id === null || isNaN(Number(category_id))) {
        return res.status(400).json({ message: "Category ID must be a valid number" });
      }
      const numCatId = Number(category_id);
      if (numCatId <= 0 || !Number.isInteger(numCatId)) {
        return res.status(400).json({ message: "Category ID must be a positive integer" });
      }
      updateData.category_id = numCatId;
    }

    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const [updated] = await Product.update(updateData, {
      where: { id }
    });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    const updatedProduct = await Product.findByPk(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deleted = await Product.destroy({
      where: { id }
    });
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
