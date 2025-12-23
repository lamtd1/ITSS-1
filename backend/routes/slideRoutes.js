import express from 'express';
import multer from 'multer';
import path from 'path';
import * as slideController from '../controllers/slideController.js';

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const router = express.Router();

// Create a new slide (supports file upload)
router.post('/', upload.single('file'), slideController.createSlide);

// Get all slides
router.get('/', slideController.getAllSlides);

// Get all tags (must be before /:id to avoid route conflict)
router.get('/tags/all', slideController.getAllTags);

// Get slide by ID
router.get('/:id', slideController.getSlideById);

// Get slide PDF (Proxy)
router.get('/:id/pdf', slideController.getSlidePdf);

// Update slide
router.put('/:id', slideController.updateSlide);

// Delete slide
router.delete('/:id', slideController.deleteSlide);

export default router;
