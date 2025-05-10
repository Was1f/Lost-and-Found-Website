import mongoose from 'mongoose';

class BaseModel {
  constructor(model) {
    this.model = model;
  }

  // Create a new document
  async create(data) {
    try {
      const newDocument = new this.model(data);
      return await newDocument.save();
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  // Find a document by ID
  async findById(id) {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new Error(`Error finding document by ID: ${error.message}`);
    }
  }

  // Find documents with optional query and options
  find(query = {}, options = {}) {
    return this.model.find(query, null, options);
  }

  // Find one document with optional query and options
  findOne(query = {}, options = {}) {
    return this.model.findOne(query, null, options);
  }

  // Update a document by ID
  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  // Update multiple documents
  async updateMany(query, data) {
    try {
      return await this.model.updateMany(query, data).exec();
    } catch (error) {
      throw new Error(`Error updating multiple documents: ${error.message}`);
    }
  }

  // Delete a document by ID
  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  // Delete multiple documents
  async deleteMany(query) {
    try {
      return await this.model.deleteMany(query).exec();
    } catch (error) {
      throw new Error(`Error deleting multiple documents: ${error.message}`);
    }
  }

  // Count documents
  async count(query = {}) {
    try {
      return await this.model.countDocuments(query).exec();
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  // Get the mongoose model for chaining operations
  getModel() {
    return this.model;
  }

  // Static method to create a query builder
  static createQueryBuilder(model) {
    return model;
  }
}

export default BaseModel; 