import express from 'express';
import News from '../models/newsModel.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all news (with filters for admin)
router.get('/news', async (req, res) => {
  try {
    const {
      status,
      category,
      department,
      important,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    
    // Build query based on filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.departments = department;
    if (important) query.important = important === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // For public access, only show published and active news
    if (!req.query.admin) {
      query.status = 'published';
      query.publishDate = { $lte: new Date() };
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const news = await News.find(query)
      .populate('departments', 'name shortName')
      .populate('relatedEvents', 'title')
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      news,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

// Get single news
router.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('departments', 'name shortName')
      .populate('relatedEvents', 'title startTime');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Increment view count
    news.viewCount += 1;
    await news.save();

    res.json({
      success: true,
      news
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

// Create news
router.post('/news', upload.single('thumbnail'), async (req, res) => {
  try {
    const newsData = JSON.parse(req.body.newsData);
    let thumbnailUrl = null;

    // Upload thumbnail if provided
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'news',
        resource_type: 'auto'
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    const news = new News({
      ...newsData,
      thumbnail: thumbnailUrl
    });

    await news.save();

    const populatedNews = await News.findById(news._id)
      .populate('departments', 'name shortName')
      .populate('relatedEvents', 'title');

    res.status(201).json({
      success: true,
      news: populatedNews
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create news: ' + error.message
    });
  }
});

// Update news
router.put('/news/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const newsData = JSON.parse(req.body.newsData);
    const existingNews = await News.findById(req.params.id);

    if (!existingNews) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Handle thumbnail update
    let thumbnailUrl = existingNews.thumbnail;
    if (req.file) {
      // Delete old thumbnail if it exists
      if (existingNews.thumbnail) {
        const publicId = existingNews.thumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new thumbnail
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'news',
        resource_type: 'auto'
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      {
        ...newsData,
        thumbnail: thumbnailUrl
      },
      { new: true, runValidators: true }
    )
    .populate('departments', 'name shortName')
    .populate('relatedEvents', 'title');

    res.json({
      success: true,
      news: updatedNews
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update news: ' + error.message
    });
  }
});

// Delete news
router.delete('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Delete thumbnail from Cloudinary if it exists
    if (news.thumbnail) {
      const publicId = news.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await news.deleteOne();

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete news: ' + error.message
    });
  }
});

export default router;