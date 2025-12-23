import Slide from '../models/slide/Slide.js';
import Tag from '../models/slide/Tag.js';
import SlideTag from '../models/slide/SlideTag.js';
import { uploadFileToDrive } from '../services/slide/googleDriveService.js';

// Validate Google Drive link format
const validateGoogleDriveLink = (link) => {
    const patterns = [
        /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/?(view|edit)?/,
        /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
    ];
    return patterns.some(pattern => pattern.test(link));
};

// Convert Google Drive link to embed URL
const convertToEmbedUrl = (link) => {
    // Extract file ID from various Google Drive URL formats
    let fileId = null;

    const match1 = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const match2 = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const match3 = link.match(/\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);

    if (match1) fileId = match1[1];
    else if (match2) fileId = match2[1];
    else if (match3) fileId = match3[2];

    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return link;
};

// Create a new slide
export const createSlide = async (req, res) => {
    try {
        const { title, link, tags, description, userId } = req.body;
        const authorId = userId || 1; // Use provided userId or default to 1

        let finalLink = link;

        // Handle File Upload
        if (req.file) {
            const driveResponse = await uploadFileToDrive(req.file);
            // Use webViewLink but convert to preview for embedding
            finalLink = driveResponse.webViewLink;
        } else {
            // Validate Google Drive link if manually entered
            if (!title || !link) {
                return res.status(400).json({
                    success: false,
                    message: 'タイトルとリンク（またはファイル）は必須です'
                });
            }

            if (!validateGoogleDriveLink(link)) {
                return res.status(400).json({
                    success: false,
                    message: '有効なGoogle Driveのリンクを入力してください'
                });
            }
        }

        // Convert to embed URL
        const embedUrl = convertToEmbedUrl(finalLink);

        // Create slide
        const slide = await Slide.create({
            userId: authorId,
            title,
            filepath: embedUrl,
            description: description || ''
        });

        // Handle tags
        if (tags && Array.isArray(tags) && tags.length > 0) {
            for (const tagName of tags) {
                // Find or create tag (convert to lowercase)
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.trim().toLowerCase() }
                });

                // Associate tag with slide
                await SlideTag.create({
                    slideId: slide.id,
                    tagId: tag.id
                });
            }
        }

        // Fetch slide with tags
        const slideWithTags = await Slide.findByPk(slide.id, {
            include: [{
                model: Tag,
                as: 'tags',
                through: { attributes: [] }
            }]
        });

        res.status(201).json({
            success: true,
            message: 'スライドが正常にアップロードされました',
            data: slideWithTags
        });
    } catch (error) {
        console.error('Error creating slide:', error);
        res.status(500).json({
            success: false,
            message: 'スライドのアップロードに失敗しました',
            error: error.message
        });
    }
};

// Get all slides
export const getAllSlides = async (req, res) => {
    try {
        const slides = await Slide.findAll({
            include: [{
                model: Tag,
                as: 'tags',
                through: { attributes: [] }
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: slides
        });
    } catch (error) {
        console.error('Error fetching slides:', error);
        res.status(500).json({
            success: false,
            message: 'スライドの取得に失敗しました',
            error: error.message
        });
    }
};

// Get slide by ID
export const getSlideById = async (req, res) => {
    try {
        const { id } = req.params;

        const slide = await Slide.findByPk(id, {
            include: [{
                model: Tag,
                as: 'tags',
                through: { attributes: [] }
            }]
        });

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'スライドが見つかりません'
            });
        }

        res.status(200).json({
            success: true,
            data: slide
        });
    } catch (error) {
        console.error('Error fetching slide:', error);
        res.status(500).json({
            success: false,
            message: 'スライドの取得に失敗しました',
            error: error.message
        });
    }
};

// Update slide
export const updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, link, tags, description } = req.body;

        const slide = await Slide.findByPk(id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'スライドが見つかりません'
            });
        }

        // Validate Google Drive link if provided
        if (link && !validateGoogleDriveLink(link)) {
            return res.status(400).json({
                success: false,
                message: '有効なGoogle Driveのリンクを入力してください'
            });
        }

        // Update slide fields
        if (title) slide.title = title;
        if (link) slide.filepath = convertToEmbedUrl(link);
        if (description !== undefined) slide.description = description;

        await slide.save();

        // Update tags if provided
        if (tags && Array.isArray(tags)) {
            // Remove existing tags
            await SlideTag.destroy({ where: { slideId: id } });

            // Add new tags
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.trim().toLowerCase() }
                });

                await SlideTag.create({
                    slideId: slide.id,
                    tagId: tag.id
                });
            }
        }

        // Fetch updated slide with tags
        const updatedSlide = await Slide.findByPk(id, {
            include: [{
                model: Tag,
                as: 'tags',
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            success: true,
            message: 'スライドが正常に更新されました',
            data: updatedSlide
        });
    } catch (error) {
        console.error('Error updating slide:', error);
        res.status(500).json({
            success: false,
            message: 'スライドの更新に失敗しました',
            error: error.message
        });
    }
};

// Delete slide
export const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;

        const slide = await Slide.findByPk(id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'スライドが見つかりません'
            });
        }

        // Delete associated tags
        await SlideTag.destroy({ where: { slideId: id } });

        // Delete slide
        await slide.destroy();

        res.status(200).json({
            success: true,
            message: 'スライドが正常に削除されました'
        });
    } catch (error) {
        console.error('Error deleting slide:', error);
        res.status(500).json({
            success: false,
            message: 'スライドの削除に失敗しました',
            error: error.message
        });
    }
};

// Get all unique tags
export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            message: 'タグの取得に失敗しました',
            error: error.message
        });
    }
};

// Stream PDF file
export const getSlidePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await Slide.findByPk(id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'スライドが見つかりません'
            });
        }

        // Extract File ID from filepath (embed URL)
        // Format: https://drive.google.com/file/d/FILE_ID/preview
        const match = slide.filepath.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: '有効なGoogle DriveファイルIDが見つかりません'
            });
        }

        const fileId = match[1];
        const { getFileStream } = await import('../services/slide/googleDriveService.js');
        const stream = await getFileStream(fileId);

        res.setHeader('Content-Type', 'application/pdf');
        stream.pipe(res);

    } catch (error) {
        console.error('Error streaming PDF:', error);
        res.status(500).json({
            success: false,
            message: 'PDFの取得に失敗しました',
            error: error.message
        });
    }
};
