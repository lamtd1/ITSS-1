import {
  Assignment,
  Question,
  User,
  AssignmentSubmission,
  sequelize,
} from "../models/index.js";
import { Op } from "sequelize";

// --- 1. TẠO BÀI TẬP (TRANSACTION) ---
export const createAssignment = async (req, res) => {
  const t = await sequelize.transaction(); // Bắt đầu transaction

  try {
    const {
      title,
      description,
      startDate,
      endDate,
      totalScore,
      assignType, // 'all' | 'specific'
      assignedStudents, // Danh sách email: ['studentA@gm.com', ...]
      questions,
      userId, // ID giáo viên (lấy từ req.user.id nếu có middleware auth)
    } = req.body;

    console.log("assignType:", assignType);
    console.log("assignedStudents:", assignedStudents);

    // --- Validate Tổng điểm ---
    const calcScore = questions.reduce(
      (sum, q) => sum + parseInt(q.score || 0),
      0
    );
    if (calcScore !== parseInt(totalScore)) {
      await t.rollback();
      return res.status(400).send({
        message: `Lỗi: Tổng điểm câu hỏi (${calcScore}) không khớp với điểm bài tập (${totalScore})`,
      });
    }

    // --- Bước 1: Tạo Assignment ---
    const newAssignment = await Assignment.create(
      {
        userId: userId,
        title: title,
        description: description,
        deadline: endDate, // Map với cột assignment_deadline
        score: totalScore,
        assignType: assignType, // Lưu loại giao bài để tham khảo
        assigneeList: assignType === "specific" ? assignedStudents : null, // Lưu danh sách email để tham khảo
      },
      { transaction: t }
    );

    // --- Bước 2: Tạo Questions ---
    if (questions && questions.length > 0) {
      const questionData = questions.map((q) => {
        // Xử lý nội dung: Nếu là trắc nghiệm, lưu JSON gồm text và options vào cột question_text
        let contentToSave = q.text;
        if (q.type === "Tno") {
          const contentObj = {
            prompt: q.text, // Nội dung câu hỏi
            options: q.options, // Mảng các lựa chọn [{id, text, isCorrect}, ...]
          };
          contentToSave = JSON.stringify(contentObj);
        }

        return {
          assignmentId: newAssignment.id, // Link với bài tập vừa tạo
          text: contentToSave, // Lưu chuỗi JSON hoặc text thường
          type: q.type,
          score: q.score,
        };
      });

      await Question.bulkCreate(questionData, { transaction: t });
    }

    // --- Bước 3: Giao bài (Tạo Assignment_Submission) ---
    let studentIds = [];

    // Tìm danh sách ID học sinh cần giao
    if (assignType === "all") {
      // Tìm tất cả user có role là 'student' (cần join bảng Role)
      // Lưu ý: Đảm bảo model Role của bạn có tên là 'Role' và quan hệ đã được thiết lập đúng
      // Nếu quan hệ User-Role là belongsToMany với alias 'roles'
      const students = await User.findAll({
        include: [
          {
            model: (await import("../models/index.js")).Role, // Dynamic import để tránh circular dependency nếu có
            as: "roles",
            where: { role_name: "User" },
          },
        ],
        attributes: ["id"],
        transaction: t,
      });
      console.log("students found:", students.length);
      console.log("students:", students);  
      studentIds = students.map((s) => s.id);
    } else if (assignedStudents && assignedStudents.length > 0) {
      // Tìm theo danh sách email gửi lên
      const students = await User.findAll({
        where: {
          email: { [Op.in]: assignedStudents },
        },
        attributes: ["id"],
        transaction: t,
      });
      studentIds = students.map((s) => s.id);
    }

    // Bulk create Submission (trạng thái ban đầu)
    if (studentIds.length > 0) {
      const submissionData = studentIds.map((sid) => ({
        assignmentId: newAssignment.id,
        userId: sid,
        status: "assigned", // Chưa làm
        score: null,
      }));

      // updateOnDuplicate: Nếu đã có rồi thì không lỗi (an toàn)
      await AssignmentSubmission.bulkCreate(submissionData, {
        transaction: t,
        ignoreDuplicates: true,
      });
    }

    await t.commit();
    res
      .status(201)
      .send({ message: "Tạo bài tập thành công!", id: newAssignment.id });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 2. LẤY DANH SÁCH BÀI TẬP (Của Giáo viên) ---
export const getTeacherAssignments = async (req, res) => {
  try {
    // Lấy userId từ query params (hoặc từ middleware auth sau này)
    // Ví dụ: GET /api/assignments?userId=1
    const userId = req.query.userId;

    const whereCondition = userId ? { userId: userId } : {};

    const assignments = await Assignment.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AssignmentSubmission,
          as: "submissions",
          attributes: ["id"], // Chỉ cần đếm số lượng bản ghi submission
        },
      ],
    });

    // Format lại dữ liệu để FE hiển thị số lượng học sinh được giao
    const responseData = assignments.map((a) => {
      const json = a.toJSON();
      return {
        ...json,
        assigneesCount: json.submissions ? json.submissions.length : 0,
      };
    });

    res.send(responseData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// --- 3. EDIT BÀI TẬP (GIÁO VIÊN) ---
export const updateAssignment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params; // ID bài tập cần sửa
    const {
      title,
      description,
      startDate,
      endDate,
      totalScore,
      assignType,
      assignedStudents,
      questions,
      userId, // ID giáo viên (để kiểm tra quyền)
    } = req.body;

    // --- Tìm bài tập ---
    const assignment = await Assignment.findByPk(id, { transaction: t });
    if (!assignment) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // --- Kiểm tra quyền sở hữu ---
    if (userId && assignment.userId !== userId) {
      await t.rollback();
      return res.status(403).send({ message: "Bạn không có quyền sửa bài tập này" });
    }

    // --- Validate Tổng điểm ---
    if (questions && questions.length > 0) {
      const calcScore = questions.reduce(
        (sum, q) => sum + parseInt(q.score || 0),
        0
      );
      if (calcScore !== parseInt(totalScore)) {
        await t.rollback();
        return res.status(400).send({
          message: `Lỗi: Tổng điểm câu hỏi (${calcScore}) không khớp với điểm bài tập (${totalScore})`,
        });
      }
    }

    // --- Bước 1: Cập nhật Assignment ---
    await assignment.update(
      {
        title: title,
        description: description,
        deadline: endDate,
        score: totalScore,
        assignType: assignType,
        assigneeList: assignType === "specific" ? assignedStudents : null,
      },
      { transaction: t }
    );

    // --- Bước 2: Cập nhật Questions (Xóa cũ, tạo mới) ---
    if (questions && questions.length > 0) {
      // Xóa tất cả câu hỏi cũ
      await Question.destroy({
        where: { assignmentId: id },
        transaction: t,
      });

      // Tạo câu hỏi mới
      const questionData = questions.map((q) => {
        let contentToSave = q.text;
        if (q.type === "Tno") {
          const contentObj = {
            prompt: q.text,
            options: q.options,
          };
          contentToSave = JSON.stringify(contentObj);
        }

        return {
          assignmentId: id,
          text: contentToSave,
          type: q.type,
          score: q.score,
        };
      });

      await Question.bulkCreate(questionData, { transaction: t });
    }

    // --- Bước 3: Cập nhật Submissions (nếu thay đổi danh sách học sinh) ---
    // Xóa submissions cũ
    await AssignmentSubmission.destroy({
      where: { assignmentId: id },
      transaction: t,
    });

    // Tạo submissions mới
    let studentIds = [];

    if (assignType === "all") {
      const students = await User.findAll({
        include: [
          {
            model: (await import("../models/index.js")).Role,
            as: "roles",
            where: { role_name: "User" },
          },
        ],
        attributes: ["id"],
        transaction: t,
      });
      studentIds = students.map((s) => s.id);
    } else if (assignedStudents && assignedStudents.length > 0) {
      const students = await User.findAll({
        where: {
          email: { [Op.in]: assignedStudents },
        },
        attributes: ["id"],
        transaction: t,
      });
      studentIds = students.map((s) => s.id);
    }

    if (studentIds.length > 0) {
      const submissionData = studentIds.map((sid) => ({
        assignmentId: id,
        userId: sid,
        status: "assigned",
        score: null,
      }));

      await AssignmentSubmission.bulkCreate(submissionData, {
        transaction: t,
        ignoreDuplicates: true,
      });
    }

    await t.commit();
    res.send({ message: "Cập nhật bài tập thành công!", id: assignment.id });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 4. XÓA BÀI TẬP (GIÁO VIÊN) ---
export const deleteAssignment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params; // ID bài tập cần xóa
    const { userId } = req.body; // ID giáo viên (để kiểm tra quyền)

    // --- Tìm bài tập ---
    const assignment = await Assignment.findByPk(id, { transaction: t });
    if (!assignment) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // --- Kiểm tra quyền sở hữu ---
    if (userId && assignment.userId !== userId) {
      await t.rollback();
      return res.status(403).send({ message: "Bạn không có quyền xóa bài tập này" });
    }

    // --- Xóa Submissions ---
    await AssignmentSubmission.destroy({
      where: { assignmentId: id },
      transaction: t,
    });

    // --- Xóa Questions ---
    await Question.destroy({
      where: { assignmentId: id },
      transaction: t,
    });

    // --- Xóa Assignment ---
    await assignment.destroy({ transaction: t });

    await t.commit();
    res.send({ message: "Xóa bài tập thành công!" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 5. LẤY DANH SÁCH BÀI TẬP (Của Học sinh) ---

// Nop bai tap



