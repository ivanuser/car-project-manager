const express = require('express');
const router = express.Router();

// Import models
const Vehicle = require('../models/Vehicle');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Part = require('../models/Part');

// Import the upload middleware from index.js
const { upload } = require('../index');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// GET all vehicles
router.get('/vehicles', async (req, res) => {
    try {
      const vehicles = await Vehicle.find();
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ message: err.message  
   
   });
    }
  });

// POST a new vehicle
router.post('/vehicles', async (req, res) => {
    const vehicle = new Vehicle({
      year: req.body.year,
      make: req.body.make,
      model: req.body.model,
      trim: req.body.trim,
      vin: req.body.vin,
      mileage: req.body.mileage,
      photos: req.body.photos 
    });
  
    try {
      const newVehicle = await vehicle.save();
      res.status(201).json(newVehicle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Upload a photo for a vehicle
router.post('/vehicles/:id/upload', getVehicle, upload-single('photo'), async (req, res) => {
    if (req.file) {
      res.vehicle.photos.push(req.file.path); 
      await res.vehicle.save();
      res.json({ message: 'Photo uploaded successfully', filePath: req.file.path });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });

// GET all projects
router.get('/projects', async (req, res) => {
    try {
      const projects = await Project.find().populate('vehicle'); // Populate the 'vehicle' field with the actual vehicle data
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // GET a single project by ID
  router.get('/projects/:id', getProject, (req, res) => {
    res.json(res.project);
  });
  
  // POST a new project
  router.post('/projects', async (req, res) => {
    const project = new Project({
      name: req.body.name,
      vehicle: req.body.vehicle, // Assuming you'll send the vehicle's ObjectId in the request
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      budget: req.body.budget,
      progress: req.body.progress,
      tasks: req.body.tasks, // We'll handle task associations later
      notes: req.body.notes,
      documents: req.body.documents // We'll handle file uploads later
    });
  
    try {
      const newProject = await project.save();
      res.status(201).json(newProject);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // PATCH (update) a project by ID
  router.patch('/projects/:id', getProject, async (req, res) => {
    if (req.body.name != null) {
      res.project.name = req.body.name;
    }
    // ... update other fields similarly ...
  
    try {
      const updatedProject = await res.project.save();
      res.json(updatedProject);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a project by ID
  router.delete('/projects/:id', getProject, async (req, res) => {
    try {
      await res.project.remove();
      res.json({ message: 'Deleted project' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// GET all tasks for a specific project
router.get('/projects/:projectId/tasks', getProject, async (req, res) => {
    res.json(res.project.tasks);
  });
  
  // POST a new task for a specific project
  router.post('/projects/:projectId/tasks', getProject, async (req, res) => {
    const task = new Task({
      description: req.body.description,
      project: req.params.projectId,
      dueDate: req.body.dueDate,
      status: req.body.status,
      priority: req.body.priority,
      assignee: req.body.assignee,
      notes: req.body.notes,
      parts: req.body.parts // We'll handle part associations later
  });
  
    try {
      const newTask = await task.save();
      res.project.tasks.push(newTask); // Add the new task to the project's tasks array
      await res.project.save();
      res.status(201).json(newTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // PATCH (update) a task by ID
  router.patch('/tasks/:id', getTask, async (req, res) => {
    if (req.body.description != null) {
      res.task.description = req.body.description;
    }
    // ... update other fields similarly ...
  
    try {
      const updatedTask = await res.task.save();
      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a task by ID
  router.delete('/tasks/:id', getTask, async (req, res) => {
    try {
      await res.task.remove();
      res.json({ message: 'Deleted task' });
    } catch (err) {
      res.status(500).json({ message: err.message  
   });
    }
  });

  // GET all parts
router.get('/parts', async (req, res) => {
    try {
      const parts = await Part.find();
      res.json(parts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// POST a new part
router.post('/parts', async (req, res) => {
    const part = new Part({
      name: req.body.name,
      brand: req.body.brand,
      partNumber: req.body.partNumber,
      quantity: req.body.quantity,
      price: req.body.price,
      supplier: req.body.supplier,
      notes: req.body.notes,
      photo: req.body.photo // We'll handle file uploads later
    });
  
    try {
      const newPart = await part.save();
      res.status(201).json(newPart);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// PATCH (update) a part by ID
router.patch('/parts/:id', getPart, async (req, res) => {
    if (req.body.name != null) {
      res.part.name = req.body.name;
    }
    // ... update other fields similarly ...
  
    try {
      const updatedPart = await res.part.save();
      res.json(updatedPart);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a part by ID
  router.delete('/parts/:id', getPart, async (req, res) => {
    try {
      await res.part.remove();
      res.json({ message: 'Deleted part' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Upload a photo for a part
router.post('/parts/:id/upload', getPart, upload.single('photo'), async (req, res) => {
    if (req.file) {
      res.part.photo = req.file.path; 
      await res.part.save();
      res.json({ message: 'Photo uploaded successfully', filePath: req.file.path });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });

// Upload a document for a project
router.post('/projects/:id/upload', getProject, upload.single('document'), async (req, res) => {
    if (req.file) {
      res.project.documents.push(req.file.path); 
      await res.project.save();
      res.json({ message: 'Document uploaded successfully', filePath: req.file.path });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });

// Middleware functions

// Middleware function to get a vehicle by ID
//async function getVehicle(req, res, next) {
//   let vehicle;
//   try {
//      vehicle = await Vehicle.findById(req.params.id);
//      if (vehicle == null) {
//        return res.status(404).json({   
//   message: 'Cannot find vehicle' });
//      }
//    } catch (err) {
//      return res.status(500).json({ message: err.message });
//    }
//
//    res.vehicle = vehicle;   
//  
//    next();
//  }

// Middleware function to get a project by ID
async function getProject(req, res, next) {
    let project;
    try {
      console.log("Project ID from request:", req.params.projectId);
      project = await Project.findById(req.params.projectId); // Use req.params.projectId here
      console.log("Retrieved project:", project); 
      if (project == null) {
        return res.status(404).json({ message: 'Cannot find project' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  
    res.project = project;
    next();
  }

// Middleware function to get a task by ID
async function getTask(req, res, next) {
    let task;
    try {
      task = await Task.findById(req.params.id);
      if (task == null) {
        return res.status(404).json({ message: 'Cannot find task'  
   });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  
    res.task = task;
    next();  
  
  }

// Middleware function to get a part by ID
async function getPart(req, res, next) {
    let part;
    try {
      part = await Part.findById(req.params.id);
      if (part == null) {
        return res.status(404).json({ message: 'Cannot find part' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  
    res.part = part;
    next();
  }

  module.exports = router;
