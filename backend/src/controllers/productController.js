const { Product, Category } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

exports.getAllProducts = async (req, res) => {
  try {
    const { category_id, categoryId, search } = req.query;
    const where = {};
    const catId = category_id !== undefined ? category_id : categoryId;
    if (catId !== undefined && catId !== '') {
      where.category_id = catId;
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
    const { name, description, price, image, stock, isAvailable, category_id, categoryId } = req.body || {};

    // Validate Name (Không được rỗng hoặc chỉ chứa khoảng trắng, Max 150 chars)
    if (name === undefined || name === null || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Tên món ăn không được để trống" });
    }
    if (name.length > 150) {
      return res.status(400).json({ message: "Product name cannot exceed 150 characters" });
    }

    // Validate Price (Phải lớn hơn 0, Max 99,999,999.99)
    if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
      return res.status(400).json({ message: "Price is required and must be a valid number" });
    }
    const numPrice = Number(price);
    if (numPrice <= 0 || numPrice > 99999999.99) {
      return res.status(400).json({ message: "Price must be greater than 0 and up to 99,999,999.99" });
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
    const catId = category_id !== undefined ? category_id : categoryId;
    if (catId === undefined || catId === null || isNaN(Number(catId))) {
      return res.status(400).json({ message: "Category ID is required and must be a valid number" });
    }
    const numCatId = Number(catId);
    if (numCatId <= 0 || !Number.isInteger(numCatId)) {
      return res.status(400).json({ message: "Category ID must be a positive integer" });
    }

    const categoryExists = await Category.findByPk(numCatId);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
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

    const { name, description, price, image, stock, isAvailable, category_id, categoryId } = req.body || {};
    const updateData = {};

    if (name !== undefined) {
      if (name === null || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: "Tên món ăn không được để trống" });
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
      if (numPrice <= 0 || numPrice > 99999999.99) {
        return res.status(400).json({ message: "Price must be greater than 0 and up to 99,999,999.99" });
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

    const catId = category_id !== undefined ? category_id : categoryId;
    if (catId !== undefined) {
      if (catId === null || isNaN(Number(catId))) {
        return res.status(400).json({ message: "Category ID must be a valid number" });
      }
      const numCatId = Number(catId);
      if (numCatId <= 0 || !Number.isInteger(numCatId)) {
        return res.status(400).json({ message: "Category ID must be a positive integer" });
      }
      const categoryExists = await Category.findByPk(numCatId);
      if (!categoryExists) {
        return res.status(400).json({ message: "Category not found" });
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
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
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
