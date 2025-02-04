import express from 'express';
import { Department } from '../Models/DepartmentModel.js';
const router = express.Router();

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch departments' 
    });
  }
});

// Get single department
router.get('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .select('-__v');
    
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        error: 'Department not found' 
      });
    }
    
    res.json({ success: true, department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch department' 
    });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  try {
    // Check if department with same name or shortName exists
    const existingDept = await Department.findOne({
      $or: [
        { name: req.body.name },
        { shortName: req.body.shortName }
      ]
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name or short name already exists'
      });
    }

    const departmentData = {
      name: req.body.name,
      shortName: req.body.shortName,
      icon: req.body.icon,
      description: req.body.description,
      color: req.body.color,
      hoverColor: req.body.hoverColor,
      totalEvents: req.body.totalEvents || 0,
      registrationDeadline: new Date(req.body.registrationDeadline)
    };

    const department = new Department(departmentData);
    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name or short name already exists'
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create department: ' + error.message
    });
  }
});

// Update department
router.put('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Only check for name/shortName conflicts if they're actually being changed
    if (
      (req.body.name && req.body.name !== department.name) || 
      (req.body.shortName && req.body.shortName !== department.shortName)
    ) {
      const existingDept = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { name: req.body.name || department.name },
          { shortName: req.body.shortName || department.shortName }
        ]
      });

      if (existingDept) {
        return res.status(400).json({
          success: false,
          error: 'Another department with this name or short name already exists'
        });
      }
    }

    // Process the update data
    const updateData = {
      name: req.body.name || department.name,
      shortName: req.body.shortName || department.shortName,
      icon: req.body.icon || department.icon,
      description: req.body.description || department.description,
      color: req.body.color || department.color,
      hoverColor: req.body.hoverColor || department.hoverColor,
      totalEvents: req.body.totalEvents || department.totalEvents,
      registrationDeadline: req.body.registrationDeadline || department.registrationDeadline
    };

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update department: ' + error.message
    });
  }
});

// Delete department
router.delete('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete department'
    });
  }
});

export default router;