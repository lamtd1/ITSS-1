import {
  Assignment,
  Question,
  User,
  AssignmentSubmission,
  Answer,
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
            where: { name: "Student" },
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


// --- 3. EDIT BÀI TẬP (GIÁO VIÊN) - IMPROVED ---
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

    // --- Validation đầu vào ---
    if (!title || !endDate || !totalScore) {
      await t.rollback();
      return res.status(400).send({ message: "Thiếu thông tin bắt buộc: title, endDate, totalScore" });
    }

    // --- Tìm bài tập ---
    const assignment = await Assignment.findByPk(id, { transaction: t });
    if (!assignment) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // --- Kiểm tra quyền sở hữu ---
    if (userId && assignment.userId !== parseInt(userId)) {
      await t.rollback();
      return res.status(403).send({ message: "Bạn không có quyền sửa bài tập này" });
    }

    // --- Kiểm tra xem có submissions đã nộp chưa ---
    const submittedCount = await AssignmentSubmission.count({
      where: {
        assignmentId: id,
        status: 'submitted'
      },
      transaction: t
    });

    if (submittedCount > 0) {
      await t.rollback();
      return res.status(400).send({
        message: `Không thể sửa bài tập đã có ${submittedCount} học sinh nộp bài. Vui lòng tạo bài tập mới.`
      });
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

    // --- Bước 3: Cập nhật Submissions (CHỈ khi chưa có ai nộp bài) ---
    // Xóa submissions cũ (chỉ những cái chưa nộp)
    await AssignmentSubmission.destroy({
      where: {
        assignmentId: id,
        status: { [Op.in]: ['assigned', 'in_progress'] }
      },
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
            where: { name: "Student" },
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
    console.error("Error updating assignment:", error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 4. XÓA BÀI TẬP (GIÁO VIÊN) - IMPROVED ---
export const deleteAssignment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params; // ID bài tập cần xóa
    // Lấy userId từ query params thay vì body cho DELETE request
    const userId = req.query.userId || req.body.userId;

    if (!userId) {
      await t.rollback();
      return res.status(400).send({ message: "userId là bắt buộc" });
    }

    // --- Tìm bài tập ---
    const assignment = await Assignment.findByPk(id, { transaction: t });
    if (!assignment) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // --- Kiểm tra quyền sở hữu ---
    if (assignment.userId !== parseInt(userId)) {
      await t.rollback();
      return res.status(403).send({ message: "Bạn không có quyền xóa bài tập này" });
    }

    // --- Kiểm tra xem có submissions đã nộp chưa ---
    const submittedCount = await AssignmentSubmission.count({
      where: {
        assignmentId: id,
        status: 'submitted'
      },
      transaction: t
    });

    if (submittedCount > 0) {
      await t.rollback();
      return res.status(400).send({
        message: `Không thể xóa bài tập đã có ${submittedCount} học sinh nộp bài. Bạn có thể ẩn bài tập này thay vì xóa.`
      });
    }

    // --- Lấy thống kê trước khi xóa ---
    const totalSubmissions = await AssignmentSubmission.count({
      where: { assignmentId: id },
      transaction: t
    });

    const questionsCount = await Question.count({
      where: { assignmentId: id },
      transaction: t
    });

    // --- Xóa theo thứ tự (foreign key constraints) ---
    // 1. Xóa Submissions trước
    await AssignmentSubmission.destroy({
      where: { assignmentId: id },
      transaction: t,
    });

    // 2. Xóa Questions
    await Question.destroy({
      where: { assignmentId: id },
      transaction: t,
    });

    // 3. Xóa Assignment
    await assignment.destroy({ transaction: t });

    await t.commit();

    res.send({
      message: "Xóa bài tập thành công!",
      deletedData: {
        assignmentId: id,
        questionsDeleted: questionsCount,
        submissionsDeleted: totalSubmissions
      }
    });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting assignment:", error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 5. LẤY DANH SÁCH BÀI TẬP (Của Học sinh) ---
export const getStudentAssignments = async (req, res) => {
  try {
    const userId = req.query.userId; // ID học sinh

    if (!userId) {
      return res.status(400).send({ message: "userId is required" });
    }

    const assignments = await AssignmentSubmission.findAll({
      where: { userId: userId },
      include: [
        {
          model: Assignment,
          as: "assignment",
          attributes: ["id", "title", "description", "deadline", "score"],
          include: [
            {
              model: Question,
              as: "questions",
              attributes: ["id", "text", "type", "score"],
            },
          ],
        },
      ],
      order: [["submittedAt", "DESC"]],
    });

    // Format dữ liệu để FE dễ xử lý
    const responseData = assignments.map((submission) => {
      const assignment = submission.assignment;
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const isOverdue = now > deadline;

      // Tính thời gian còn lại
      const timeDiff = deadline - now;
      let remainingTime = "Đã hết hạn";

      if (!isOverdue) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
          remainingTime = `${days} ngày`;
        } else if (hours > 0) {
          remainingTime = `${hours} giờ`;
        } else {
          remainingTime = "Dưới 1 giờ";
        }
      }

      // Tính progress dựa trên status
      let progress = 0;
      if (submission.status === "submitted") progress = 100;
      else if (submission.status === "in_progress") progress = 50;
      else if (submission.status === "assigned") progress = 0;

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        totalScore: assignment.score,
        submissionId: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
        score: submission.score,
        remainingTime,
        progress,
        isOverdue,
        questionCount: assignment.questions ? assignment.questions.length : 0,
      };
    });

    res.send(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// --- 6. LẤY CHI TIẾT BÀI TẬP VÀ CÂU HỎI (Để học sinh làm bài) ---
export const getAssignmentDetails = async (req, res) => {
  try {
    const { id } = req.params; // ID assignment
    const { userId } = req.query; // ID học sinh

    if (!userId) {
      return res.status(400).send({ message: "userId is required" });
    }

    // Kiểm tra xem học sinh có được giao bài này không
    const submission = await AssignmentSubmission.findOne({
      where: {
        assignmentId: id,
        userId: userId
      }
    });

    if (!submission) {
      return res.status(403).send({ message: "Bạn không có quyền truy cập bài tập này" });
    }

    // Lấy thông tin bài tập và câu hỏi
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
          attributes: ["id", "text", "type", "score"],
        },
      ],
    });

    if (!assignment) {
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // Parse câu hỏi - nếu đã chấm xong thì show đáp án đúng
    const isGraded = submission.status === 'graded';

    const questionsForStudent = assignment.questions.map((q) => {
      if (q.type === "Tno") {
        try {
          const content = JSON.parse(q.text);
          return {
            id: q.id,
            text: content.prompt,
            type: q.type,
            score: q.score,
            options: content.options.map((opt) => {
              const optionData = {
                id: opt.id,
                text: opt.text,
              };
              // Only include isCorrect if assignment is graded
              if (isGraded) {
                optionData.isCorrect = opt.isCorrect;
              }
              return optionData;
            }),
          };
        } catch (e) {
          return {
            id: q.id,
            text: q.text,
            type: q.type,
            score: q.score,
          };
        }
      } else {
        return {
          id: q.id,
          text: q.text,
          type: q.type,
          score: q.score,
        };
      }
    });


    // Fetch student's answers from Answers table
    const studentAnswers = await Answer.findAll({
      where: {
        userId: userId,
        questionId: assignment.questions.map(q => q.id)
      }
    });

    // Format answers for frontend: [{ questionId, answer }]
    const answersFormatted = studentAnswers.map(ans => ({
      questionId: ans.questionId,
      answer: ans.text  // answer_text contains the student's response
    }));

    res.send({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        score: assignment.score,
      },
      questions: questionsForStudent,
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
        score: submission.score,
        answers: answersFormatted,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// --- 7. NỘP BÀI TẬP ---
export const submitAssignment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params; // ID assignment
    const { userId, answers } = req.body; // ID học sinh và câu trả lời

    // answers format: [{ questionId: 1, answer: "option_id" hoặc "text" }, ...]

    if (!userId || !answers) {
      await t.rollback();
      return res.status(400).send({ message: "userId và answers là bắt buộc" });
    }

    // Tìm submission
    const submission = await AssignmentSubmission.findOne({
      where: {
        assignmentId: id,
        userId: userId
      },
      transaction: t
    });

    if (!submission) {
      await t.rollback();
      return res.status(403).send({ message: "Không tìm thấy bài tập được giao" });
    }

    // Kiểm tra deadline
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
        },
      ],
      transaction: t
    });

    const now = new Date();
    const deadline = new Date(assignment.deadline);
    if (now > deadline) {
      await t.rollback();
      return res.status(400).send({ message: "Đã quá hạn nộp bài" });
    }

    // Tính điểm tự động cho câu trắc nghiệm và tạo Answer records
    let totalScore = 0;

    for (const userAnswer of answers) {
      const question = assignment.questions.find(q => q.id === userAnswer.questionId);
      if (!question) continue;

      let earnedScore = null;

      if (question.type === "Tno") {
        try {
          const content = JSON.parse(question.text);
          const correctOption = content.options.find(opt => opt.isCorrect);
          if (correctOption && correctOption.id == userAnswer.answer) {
            earnedScore = question.score;
          } else {
            earnedScore = 0;
          }
        } catch (e) {
          console.error("Error parsing question content:", e);
          earnedScore = 0;
        }
      }
      // For essay questions, earnedScore remains null

      // Create Answer record
      await Answer.create({
        userId,
        questionId: question.id,
        text: String(userAnswer.answer), // Convert to string for both MCQ (option ID) and essay
        score: earnedScore
      }, { transaction: t });

      if (earnedScore !== null) {
        totalScore += earnedScore;
      }
    }

    // Cập nhật submission
    // Kiểm tra xem có câu tự luận nào không
    const hasEssayQuestion = assignment.questions.some(q => q.type !== "Tno");
    const finalStatus = hasEssayQuestion ? "pending_grading" : "submitted";

    await submission.update({
      status: finalStatus,
      submittedAt: new Date(),
      score: totalScore, // Điểm hiện tại (chỉ trắc nghiệm)
    }, { transaction: t });

    await t.commit();

    res.send({
      message: "Nộp bài thành công!",
      score: totalScore,
      submissionId: submission.id
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 8. LƯU BÀI TẠM THỜI (DRAFT) ---
export const saveDraft = async (req, res) => {
  try {
    const { id } = req.params; // ID assignment
    const { userId, answers } = req.body;

    const submission = await AssignmentSubmission.findOne({
      where: {
        assignmentId: id,
        userId: userId
      }
    });

    if (!submission) {
      return res.status(403).send({ message: "Không tìm thấy bài tập được giao" });
    }

    // Lưu answers tạm thời
    await submission.update({
      status: "in_progress",
      answers: JSON.stringify(answers),
    });

    res.send({ message: "Đã lưu bản nháp" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};


export const getTeacherAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    // Lưu ý: Cần thêm logic kiểm tra userId ở đây nếu muốn bảo mật chặt chẽ hơn

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
        },
      ],
    });

    if (!assignment) {
      return res.status(404).send({ message: "Không tìm thấy bài tập" });
    }

    // Parse nội dung câu hỏi từ JSON string sang Object để FE hiển thị
    const formattedQuestions = assignment.questions.map((q) => {
      let parsedText = q.text;
      let options = [];

      if (q.type === "Tno") {
        try {
          const contentObj = JSON.parse(q.text);
          parsedText = contentObj.prompt; // Lấy câu hỏi
          options = contentObj.options;   // Lấy options (gồm cả isCorrect)
        } catch (e) {
          console.error("Error parsing question JSON", e);
        }
      }

      return {
        id: q.id,
        text: parsedText,
        type: q.type,
        score: q.score,
        options: options, // Trả về full options để giáo viên sửa
      };
    });

    res.send({
      ...assignment.toJSON(),
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// --- 9. CHẤM ĐIỂM (GIÁO VIÊN) ---
export const gradeSubmission = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { submissionId } = req.params;
    const { scores, feedback } = req.body;
    // scores: { questionId: score, ... }
    // feedback: "Nhận xét chung" (optional)

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [{
        model: Assignment,
        as: 'assignment',
        include: [{ model: Question, as: 'questions' }]
      }],
      transaction: t
    });
    if (!submission) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy bài nộp" });
    }

    // Cập nhật điểm cho từng câu trả lời trong bảng Answers
    let newTotalScore = 0;

    for (const questionId in scores) {
      const teacherScore = parseInt(scores[questionId]);

      // Update Answer record
      const [updateCount] = await Answer.update(
        { score: teacherScore },
        {
          where: {
            userId: submission.userId,
            questionId: parseInt(questionId)
          },
          transaction: t
        }
      );

      // Warn if no records updated (student may need to resubmit)
      if (updateCount === 0) {
        console.warn(`No Answer record found for userId=${submission.userId}, questionId=${questionId}. Student may need to resubmit.`);
      }
    }

    // Recalculate total score from all Answers
    const allAnswers = await Answer.findAll({
      where: { userId: submission.userId },
      include: [{
        model: Question,
        as: 'question',
        where: { assignmentId: submission.assignmentId }
      }],
      transaction: t
    });

    newTotalScore = allAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);

    await submission.update({
      score: newTotalScore,
      status: "graded",
    }, { transaction: t });

    await t.commit();
    res.send({ message: "Chấm điểm thành công", totalScore: newTotalScore });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send({ message: "Lỗi server: " + error.message });
  }
};

// --- 10. LẤY TIẾN ĐỘ HỌC SINH (ADMIN DASHBOARD) ---
export const getStudentProgress = async (req, res) => {
  try {
    // Lấy tất cả học sinh
    const students = await User.findAll({
      include: [
        {
          model: (await import("../models/index.js")).Role,
          as: "roles",
          where: { name: "Student" },
          attributes: []
        },
      ],
      attributes: ["id", "username", "email"],
      // Giả sử có cột avatar, nếu không thì bỏ
    });

    // Lấy thống kê submission cho từng học sinh
    // Cách tối ưu: Group by userId trong bảng Submission
    // Tuy nhiên để đơn giản, map qua từng user (lưu ý performance nếu user đông)

    const progressData = await Promise.all(students.map(async (student) => {
      const totalAssignments = await AssignmentSubmission.count({ where: { userId: student.id } });
      const completedAssignments = await AssignmentSubmission.count({
        where: {
          userId: student.id,
          status: { [Op.in]: ["submitted", "graded", "completed", "pending_grading"] }
        }
      });

      // Tính %
      const percent = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

      return {
        id: student.id,
        name: student.username, // Hoặc fullName nếu có
        email: student.email,
        code: "NVA", // Mock hoặc lấy từ DB nếu có cột studentCode
        progress: percent,
        completedCounts: `${completedAssignments}/${totalAssignments}`,
        status: "online", // Mock status
        status: "online", // Mock status
      };
    }));

    res.send(progressData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// --- 11. LẤY DANH SÁCH BÀI TẬP CỦA MỘT HỌC SINH (CHO GIÁO VIÊN XEM ĐỂ CHẤM) ---
export const getStudentAssignmentsForTeacher = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await AssignmentSubmission.findAll({
      where: { userId: studentId },
      include: [
        {
          model: Assignment,
          as: "assignment",
          attributes: ["id", "title", "deadline", "score"]
        }
      ],
      order: [["submittedAt", "DESC"]]
    });

    const data = submissions.map(sub => {
      // Logic tính trạng thái hiển thị
      let statusDisplay = "Chưa làm";
      if (sub.status === "assigned") statusDisplay = "Chưa làm";
      else if (sub.status === "in_progress") statusDisplay = "Đang làm";
      else if (sub.status === "submitted") statusDisplay = "Đã nộp"; // Cũ
      else if (sub.status === "pending_grading") statusDisplay = "Chờ chấm"; // Mới
      else if (sub.status === "graded") statusDisplay = "Đã chấm";

      if (!sub.assignment) return null; // Skip if assignment deleted

      return {
        submissionId: sub.id,
        assignmentId: sub.assignment.id,
        title: sub.assignment.title,
        deadline: sub.assignment.deadline,
        submittedAt: sub.submittedAt,
        status: sub.status,
        statusDisplay: statusDisplay,
        score: sub.score,
        totalScore: sub.assignment.score
      };
    });

    res.send(data.filter(Boolean)); // Filter out nulls
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// --- 12. LẤY CHI TIẾT BÀI LÀM ĐỂ CHẤM ---
export const getSubmissionForGrading = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [
        {
          model: User, // Info học sinh
          as: "student",
          attributes: ["id", "username", "email"]
        },
        {
          model: Assignment,
          as: "assignment",
          include: [{ model: Question, as: "questions" }]
        }
      ]
    });

    if (!submission) return res.status(404).send({ message: "Not found" });

    // Parse questions & fetch answers from Answers table
    const questions = submission.assignment.questions.map(q => {
      let content = q.text;
      let options = [];
      if (q.type === 'Tno') {
        try {
          const parsed = JSON.parse(q.text);
          content = parsed.prompt;
          options = parsed.options;
        } catch (e) { }
      }
      return {
        id: q.id,
        text: content,
        type: q.type,
        options,
        maxScore: q.score
      };
    });

    // Fetch student answers from Answers table
    const studentAnswers = await Answer.findAll({
      where: {
        userId: submission.userId,
        questionId: questions.map(q => q.id)
      }
    });

    // Merge answers vào questions để FE dễ render
    const gradingData = questions.map(q => {
      const ans = studentAnswers.find(a => a.questionId === q.id);
      return {
        ...q,
        studentAnswer: ans ? ans.text : null,
        earnedScore: ans ? (ans.score ?? 0) : 0,
        autoGraded: q.type === 'Tno'
      };
    });

    res.send({
      submissionId: submission.id,
      studentName: submission.student.username,
      assignmentTitle: submission.assignment.title,
      questions: gradingData,
      totalScore: submission.score,
      maxTotalScore: submission.assignment.score,
      status: submission.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};