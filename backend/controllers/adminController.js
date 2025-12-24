import {
    User,
    Assignment,
    Slide,
    Role
} from '../models/index.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Count Slides
        const slidesCount = await Slide.count();

        // 2. Count Assignments
        const assignmentsCount = await Assignment.count();

        // 3. Count Students
        // Need to find the Role ID for 'Student' first, or include Role in query
        // Optimally, just count Users associated with Student role
        const studentsCount = await User.count({
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { name: 'Student' } // Ensure this matches exactly with your DB seed
                }
            ]
        });

        res.status(200).json({
            slides: slidesCount,
            assignments: assignmentsCount,
            students: studentsCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê dashboard' });
    }
};
