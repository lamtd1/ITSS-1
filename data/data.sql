-- Clean up existing data and reset sequences to avoid ID conflicts
TRUNCATE TABLE "User",
"Role",
"Permission",
"Flashcard_Set",
"Flashcard",
"Slide",
"Tag",
"Assignment",
"Question",
"Answers",
"Assignment_Submission",
"Recent_Activitie" RESTART IDENTITY CASCADE;

-- Fix lỗi thiếu default value cho các cột created_at (User, Flashcard, Slide...)
ALTER TABLE "User" ALTER COLUMN user_created_at SET DEFAULT NOW();

ALTER TABLE "Flashcard_Set"
ALTER COLUMN set_created_at
SET DEFAULT NOW();

ALTER TABLE "Flashcard"
ALTER COLUMN flashcard_created_at
SET DEFAULT NOW();

ALTER TABLE "Slide" ALTER COLUMN slide_created_at SET DEFAULT NOW();

ALTER TABLE "Slide_Note"
ALTER COLUMN slide_note_created_at
SET DEFAULT NOW();

ALTER TABLE "Assignment"
ALTER COLUMN assignment_created_at
SET DEFAULT NOW();

ALTER TABLE "Answers"
ALTER COLUMN answer_submitted_at
SET DEFAULT NOW();

ALTER TABLE "Assignment_Submission"
ALTER COLUMN submission_submitted_at
SET DEFAULT NOW();

ALTER TABLE "Recent_Activitie"
ALTER COLUMN activity_time
SET DEFAULT NOW();

-- 1. Thêm dữ liệu vào bảng Role (2 quyền: Admin và User)
INSERT INTO
    "Role" (role_name, role_description)
VALUES (
        'Admin',
        'Quản trị viên - Có quyền quản lý và tạo nội dung'
    ), -- ID sẽ là 1
    (
        'Student',
        'Học sinh - Quyền sử dụng và tra cứu'
    );
-- ID sẽ là 2

-- 2. Thêm dữ liệu vào bảng Permission (4 quyền)
INSERT INTO
    "Permission" (
        permission_name,
        permission_description
    )
VALUES (
        'create_slide',
        'Quyền tạo slide bài giảng'
    ), -- ID 1 (Của GV)
    (
        'create_question',
        'Quyền tạo ngân hàng câu hỏi'
    ), -- ID 2 (Của GV)
    (
        'search',
        'Quyền tra cứu thông tin'
    ), -- ID 3 (Chung)
    (
        'use_flashcard',
        'Quyền sử dụng Flashcard'
    );
-- ID 4 (Chung)

INSERT INTO
    "Role_Permission" (role_id, permission_id)
VALUES
    -- Quyền cho Admin (được tất cả quyền)
    (1, 1), -- Admin được tạo slide
    (1, 2), -- Admin được tạo câu hỏi
    (1, 3), -- Admin được tra cứu
    (1, 4), -- Admin được dùng flashcard

-- Quyền cho User (chỉ quyền chung)
(2, 3), -- User được tra cứu
(2, 4);
-- User được dùng flashcard

INSERT INTO
    "User" (
        user_name,
        user_email,
        user_password,
        user_phone
    )
VALUES
    -- 2 Admin (bcrypt hashed 'password123')
    (
        'Admin One',
        'admin1@school.edu.vn',
        '$2b$10$m2/S9QNSxmZSvVLxwvn5zOvromoZej.1N8T7B0l0Kd7lhftI8LQ8O',
        '0901111111'
    ), -- User ID 1
    (
        'Admin Two',
        'admin2@school.edu.vn',
        '$2b$10$m2/S9QNSxmZSvVLxwvn5zOvromoZej.1N8T7B0l0Kd7lhftI8LQ8O',
        '0902222222'
    ), -- User ID 2

-- 10 Học sinh (bcrypt hashed 'pass123')
(
    'Hoc Sinh A',
    'hs1@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111111'
), -- User ID 3
(
    'Hoc Sinh B',
    'hs2@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111112'
), -- User ID 4
(
    'Hoc Sinh C',
    'hs3@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111113'
), -- User ID 5
(
    'Hoc Sinh D',
    'hs4@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111114'
), -- User ID 6
(
    'Hoc Sinh E',
    'hs5@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111115'
), -- User ID 7
(
    'Hoc Sinh F',
    'hs6@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111116'
), -- User ID 8
(
    'Hoc Sinh G',
    'hs7@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111117'
), -- User ID 9
(
    'Hoc Sinh H',
    'hs8@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111118'
), -- User ID 10
(
    'Hoc Sinh I',
    'hs9@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111119'
), -- User ID 11
(
    'Hoc Sinh K',
    'hs10@school.edu.vn',
    '$2b$10$9eqxbiMgxYCJ/LYLag7tF.2H.3pvHQ/pQ7Tv5xPffmjZKXlihP4.W',
    '0911111120'
);
-- User ID 12

INSERT INTO
    "User_Role" (user_id, role_id)
VALUES
    -- Gán 2 Admin
    (1, 1),
    (2, 1),

-- Gán 10 User
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2);

--------------------------------------------------------------------------
-- 6. THÊM DỮ LIỆU FLASHCARD (MỚI)
--------------------------------------------------------------------------

INSERT INTO
    "Flashcard_Set" (
        user_id,
        set_title,
        set_description
    )
VALUES
    -- User 1 (Admin)
    (
        1,
        'Từ vựng CNTT',
        'Các từ vựng chuyên ngành công nghệ thông tin cơ bản'
    ), -- Set ID 1

-- User 2 (Admin)
(
    2,
    'Từ vựng Trường học',
    'Đồ dùng và các danh từ trong lớp học'
), -- Set ID 2

-- User 3 (User)
(
    3,
    'Chào hỏi cơ bản',
    'Những câu chào hỏi thường dùng hàng ngày'
), -- Set ID 3

-- User 4 (User)
(
    4,
    'Đồ dùng học tập',
    'Các vật dụng văn phòng phẩm'
), -- Set ID 4

-- User 5 (User)
(
    5,
    'Gia đình',
    'Cách gọi tên các thành viên trong gia đình'
), -- Set ID 5

-- User 6 (User)
(
    6,
    'Động vật',
    'Tên các loài động vật thân thuộc'
), -- Set ID 6

-- User 7 (User)
(
    7,
    'Màu sắc',
    'Danh sách các màu cơ bản'
), -- Set ID 7

-- User 8 (User)
(
    8,
    'Số đếm',
    'Đếm số từ 1 đến 5'
), -- Set ID 8

-- User 9 (User)
(
    9,
    'Động từ cơ bản 1',
    'Các động từ di chuyển và ăn uống'
), -- Set ID 9

-- User 10 (User)
(
    10,
    'Động từ cơ bản 2',
    'Các động từ tri giác và giao tiếp'
), -- Set ID 10

-- User 11 (User)
(
    11,
    'Thời gian',
    'Các mốc thời gian trong ngày'
), -- Set ID 11

-- User 12 (User)
( 12, 'Phương tiện', 'Các phương tiện giao thông phổ biến' );
-- Set ID 12

-- 6b. Thêm dữ liệu vào bảng Flashcard (Gán vào set_id và thêm trạng thái học)
INSERT INTO
    "Flashcard" (
        set_id,
        flashcard_front,
        flashcard_back,
        flashcard_is_learned
    )
VALUES

-- === SET 1: Từ vựng CNTT (Của GV 1) - 3/5 đã học ===
(
    1,
    'Pasokon (パソコン)',
    'Máy tính cá nhân',
    TRUE
),
(
    1,
    'Mausu (マウス)',
    'Chuột máy tính',
    TRUE
),
(
    1,
    'Kiiboodo (キーボード)',
    'Bàn phím',
    FALSE
),
(
    1,
    'Gamen (画面)',
    'Màn hình',
    TRUE
),
(
    1,
    'Intaanetto (インターネット)',
    'Mạng Internet',
    FALSE
),

-- === SET 2: Từ vựng Trường học (Của GV 2) - 1/5 đã học ===
(
    2,
    'Sensei (先生)',
    'Giáo viên',
    TRUE
),
(
    2,
    'Kyoushitsu (教室)',
    'Lớp học',
    FALSE
),
(
    2,
    'Kokuban (黒板)',
    'Bảng đen',
    FALSE
),
(
    2,
    'Jugyou (授業)',
    'Giờ học',
    FALSE
),
(
    2,
    'Shukudai (宿題)',
    'Bài tập về nhà',
    FALSE
),

-- === SET 3: Chào hỏi cơ bản (HS A) - 5/5 đã học (Hoàn thành 100%) ===
(
    3,
    'Konnichiwa (こんにちは)',
    'Xin chào (ban ngày)',
    TRUE
),
(
    3,
    'Ohayou (おはよう)',
    'Chào buổi sáng',
    TRUE
),
(
    3,
    'Konbanwa (こんばんは)',
    'Chào buổi tối',
    TRUE
),
(
    3,
    'Arigatou (ありがとう)',
    'Cảm ơn',
    TRUE
),
(
    3,
    'Sayounara (さようなら)',
    'Tạm biệt',
    TRUE
),

-- === SET 4: Đồ dùng học tập (HS B) - 2/5 đã học ===
(4, 'Hon (本)', 'Sách', TRUE),
(
    4,
    'Enpitsu (鉛筆)',
    'Bút chì',
    FALSE
),
(
    4,
    'Kaban (鞄)',
    'Cặp sách',
    TRUE
),
(
    4,
    'Nooto (ノート)',
    'Vở ghi chép',
    FALSE
),
(
    4,
    'Keshigomu (消しゴム)',
    'Cục tẩy',
    FALSE
),

-- === SET 5: Gia đình (HS C) - 0/5 đã học (Mới tạo) ===
(
    5,
    'Kazoku (家族)',
    'Gia đình',
    FALSE
),
(
    5,
    'Chichi (父)',
    'Bố (của mình)',
    FALSE
),
(
    5,
    'Haha (母)',
    'Mẹ (của mình)',
    FALSE
),
(
    5,
    'Ani (兄)',
    'Anh trai',
    FALSE
),
(
    5,
    'Ane (姉)',
    'Chị gái',
    FALSE
),

-- === SET 6: Động vật (HS D) - 4/5 đã học ===
(6, 'Inu (犬)', 'Con chó', TRUE),
(
    6,
    'Neko (猫)',
    'Con mèo',
    TRUE
),
(
    6,
    'Tori (鳥)',
    'Con chim',
    TRUE
),
(
    6,
    'Sakana (魚)',
    'Con cá',
    FALSE
),
(
    6,
    'Uma (馬)',
    'Con ngựa',
    TRUE
),

-- === SET 7: Màu sắc (HS E) - 2/5 đã học ===
(7, 'Aka (赤)', 'Màu đỏ', TRUE),
(
    7,
    'Ao (青)',
    'Màu xanh dương',
    FALSE
),
(
    7,
    'Shiro (白)',
    'Màu trắng',
    FALSE
),
(
    7,
    'Kuro (黒)',
    'Màu đen',
    TRUE
),
(
    7,
    'Kiiro (黄色)',
    'Màu vàng',
    FALSE
),

-- === SET 8: Số đếm (HS F) - 5/5 đã học ===
(8, 'Ichi (一)', 'Số 1', TRUE),
(8, 'Ni (二)', 'Số 2', TRUE),
(8, 'San (三)', 'Số 3', TRUE),
(8, 'Yon (四)', 'Số 4', TRUE),
(8, 'Go (五)', 'Số 5', TRUE),

-- === SET 9: Động từ 1 (HS G) - 1/5 đã học ===
(
    9,
    'Tabemasu (食べます)',
    'Ăn',
    TRUE
),
(
    9,
    'Nomimasu (飲みます)',
    'Uống',
    FALSE
),
(
    9,
    'Ikimasu (行きます)',
    'Đi',
    FALSE
),
(
    9,
    'Kimasu (来ます)',
    'Đến',
    FALSE
),
(
    9,
    'Kaerimasu (帰ります)',
    'Trở về',
    FALSE
),

-- === SET 10: Động từ 2 (HS H) - 3/5 đã học ===
(
    10,
    'Mimasu (見ます)',
    'Xem, nhìn',
    TRUE
),
(
    10,
    'Kikimasu (聞きます)',
    'Nghe',
    FALSE
),
(
    10,
    'Yomimasu (読みます)',
    'Đọc',
    TRUE
),
(
    10,
    'Kakimasu (書きます)',
    'Viết',
    TRUE
),
(
    10,
    'Hanashimasu (話します)',
    'Nói chuyện',
    FALSE
),

-- === SET 11: Thời gian (HS I) - 2/5 đã học ===
(
    11,
    'Ima (今)',
    'Bây giờ',
    TRUE
),
(
    11,
    'Mainichi (毎日)',
    'Mỗi ngày',
    FALSE
),
(
    11,
    'Asa (朝)',
    'Buổi sáng',
    TRUE
),
(
    11,
    'Hiru (昼)',
    'Buổi trưa',
    FALSE
),
(
    11,
    'Yoru (夜)',
    'Buổi tối',
    FALSE
),

-- === SET 12: Phương tiện (HS K) - 4/5 đã học ===
(
    12,
    'Kuruma (車)',
    'Ô tô',
    TRUE
),
(
    12,
    'Jitensha (自転車)',
    'Xe đạp',
    TRUE
),
(
    12,
    'Densha (電車)',
    'Tàu điện',
    FALSE
),
(
    12,
    'Basu (バス)',
    'Xe buýt',
    TRUE
),
(
    12,
    'Hikouki (飛行機)',
    'Máy bay',
    TRUE
);

-- 7. Thêm dữ liệu Tag (4 Tag)
INSERT INTO
    "Tag" (tag_name)
VALUES ('Nihongo'), -- Tag ID 1
    ('Vietnam'), -- Tag ID 2
    ('ITSS1'), -- Tag ID 3
    ('ITSS2');
-- Tag ID 4

-- 8. Thêm dữ liệu Slide (3 Slides cho GV1 và GV2)
INSERT INTO
    "Slide" (
        user_id,
        slide_title,
        slide_file_path,
        slide_description
    )
VALUES
    -- Slide 1: Của GV1 (User ID 1)
    (
        1,
        '03_Webアプリ - 仕様書(1)_事前課題.pdf',
        'https://drive.google.com/file/d/17JAUFfKzMTKD9FTJP9qlpfbSN8Zv7Vxk/view?usp=sharing',
        'Tài liệu đặc tả yêu cầu và bài tập chuẩn bị.'
    ),

-- Slide 2: Của GV2 (User ID 2)
(
    2,
    '07_Webアプリ - プロダクトバックログ(2).pdf',
    'https://drive.google.com/file/d/1ApLH2dB1IUbWc9KxlqCdmEUzFV1Cg1Dp/view?usp=sharing',
    'Tài liệu chi tiết về Product Backlog.'
),

-- Slide 3: Của GV2 (User ID 2)
(
    2,
    '09_Webアプリ - スプリント1バックログ作成報告.pdf',
    'https://drive.google.com/file/d/1flAgQuLKwZH37bND3-H4nGa9ilOGyo1T/view?usp=sharing',
    'Báo cáo kết quả tạo Backlog cho Sprint 1.'
);

-- 9. Gán Tag cho Slide (Slide_Tag)
INSERT INTO
    "Slide_Tag" (slide_id, tag_id)
VALUES
    -- Slide 1 (ID 1)
    (1, 1),
    (1, 3),
    -- Slide 2 (ID 2)
    (2, 1),
    (2, 3),
    -- Slide 3 (ID 3)
    (3, 1),
    (3, 3);

-- 10. Thêm Ghi chú cho Slide (Slide_Note)
INSERT INTO
    "Slide_Note" (
        slide_id,
        user_id,
        slide_note_page,
        slide_note_content
    )
VALUES
    -- HS A (User 3) - Slide 1, Page 2
    (
        1,
        3,
        2,
        'Trang này nhiều thuật ngữ khó quá, chưa hiểu rõ.'
    ),
    -- HS B (User 4) - Slide 2, Page 5
    (
        2,
        4,
        5,
        'Phần backlog này giải thích rất chi tiết, dễ hiểu.'
    ),
    -- HS C (User 5) - Slide 3, Page 1
    (
        3,
        5,
        1,
        'Mục tiêu sprint chưa được làm rõ ở đoạn mở đầu.'
    ),
    -- HS D (User 6) - Slide 1, Page 3
    (
        1,
        6,
        3,
        'Biểu đồ này rất trực quan, giúp em hiểu luồng dữ liệu.'
    ),
    -- HS E (User 7) - Slide 2, Page 4
    (
        2,
        7,
        4,
        'Em nghĩ phần priority này cần xem lại logic.'
    ),
    -- HS F (User 8) - Slide 3, Page 2
    (
        3,
        8,
        2,
        'Chỗ này có lỗi chính tả trong tên biến.'
    ),
    -- HS G (User 9) - Slide 1, Page 5
    (
        1,
        9,
        5,
        'Phần bài tập về nhà này deadline là khi nào ạ?'
    ),
    -- HS H (User 10) - Slide 2, Page 1
    (
        2,
        10,
        1,
        'Slide mở đầu hơi dài dòng.'
    ),
    -- HS I (User 11) - Slide 3, Page 3
    (
        3,
        11,
        3,
        'Em chưa hiểu cách tính story point ở trang này.'
    ),
    -- HS K (User 12) - Slide 2, Page 3
    (
        2,
        12,
        3,
        'Đoạn mô tả user story này rất hay!'
    );

-- 11. Thêm Bài tập (Assignment) - 3 Bài tương ứng 3 Slide
INSERT INTO
    "Assignment" (
        user_id,
        assignment_title,
        assignment_description,
        assignment_deadline,
        assignment_score
    )
VALUES (
        1,
        'Bài tập Slide 1: Đặc tả yêu cầu',
        'Hoàn thành câu hỏi trắc nghiệm và tự luận về tài liệu đặc tả.',
        '2023-12-01',
        100
    ), -- ID 1
    (
        2,
        'Bài tập Slide 2: Product Backlog',
        'Kiểm tra kiến thức về các hạng mục trong Backlog.',
        '2023-12-05',
        100
    ), -- ID 2
    (
        2,
        'Bài tập Slide 3: Sprint 1 Report',
        'Phân tích báo cáo Sprint 1 và đề xuất cải tiến.',
        '2023-12-10',
        100
    );
-- ID 3

-- 12. Thêm Câu hỏi (Question) - Mỗi Assignment 2 câu (30đ/70đ)
INSERT INTO
    "Question" (
        assignment_id,
        question_text,
        question_type,
        question_score
    )
VALUES
    -- Assignment 1 (ID 1)
    (
        1,
        'Đâu là thành phần bắt buộc trong tài liệu đặc tả?',
        'Trắc nghiệm',
        30
    ), -- QID 1
    (
        1,
        'Hãy viết đoạn văn ngắn mô tả luồng đi của chức năng Đăng nhập.',
        'Tự luận',
        70
    ), -- QID 2

-- Assignment 2 (ID 2)
(
    2,
    'Ai là người chịu trách nhiệm chính về Product Backlog?',
    'Trắc nghiệm',
    30
), -- QID 3
(
    2,
    'Tại sao việc ưu tiên (Prioritization) lại quan trọng trong Backlog?',
    'Tự luận',
    70
), -- QID 4

-- Assignment 3 (ID 3)
(
    3,
    'Sprint Review diễn ra khi nào?',
    'Trắc nghiệm',
    30
), -- QID 5
(
    3,
    'Dựa trên báo cáo, hãy liệt kê 3 điểm cần khắc phục cho Sprint sau.',
    'Tự luận',
    70
);
-- QID 6

-- 13. Thêm Câu trả lời & Bài nộp (Answers & Assignment_Submission)

-- === ASSIGNMENT 1 (User 3,4,5,6,7) ===
-- User 3: 25 + 60 = 85
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (3, 1, 'Đáp án A', 25),
    (3, 2, 'Mô tả chi tiết...', 60);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (3, 1, 'Đã nộp', 85);

-- User 4: 30 + 50 = 80
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (4, 1, 'Đáp án B', 30),
    (
        4,
        2,
        'User nhập user/pass...',
        50
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (4, 1, 'Đã nộp', 80);

-- User 5: 10 + 40 = 50
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (5, 1, 'Đáp án C', 10),
    (5, 2, 'Không rõ lắm...', 40);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (5, 1, 'Đã nộp', 50);

-- User 6: 28 + 65 = 93
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (6, 1, 'Đáp án A', 28),
    (6, 2, 'Rất chi tiết...', 65);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (6, 1, 'Đã nộp', 93);

-- User 7: 15 + 30 = 45
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (7, 1, 'Đáp án D', 15),
    (7, 2, 'Viết sơ sài...', 30);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (7, 1, 'Đã nộp', 45);

-- === ASSIGNMENT 2 (User 4,5,6,7,8) ===
-- User 4: 30 + 65 = 95
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (4, 3, 'Product Owner', 30),
    (
        4,
        4,
        'Để tối ưu giá trị...',
        65
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (4, 2, 'Đã nộp', 95);

-- User 5: 20 + 50 = 70
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (5, 3, 'Scrum Master', 20),
    (
        5,
        4,
        'Để làm nhanh hơn...',
        50
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (5, 2, 'Đã nộp', 70);

-- User 6: 30 + 70 = 100
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (6, 3, 'Product Owner', 30),
    (
        6,
        4,
        'Phân tích xuất sắc...',
        70
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (6, 2, 'Đã nộp', 100);

-- User 7: 10 + 20 = 30
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (7, 3, 'Dev Team', 10),
    (7, 4, 'Không biết...', 20);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (7, 2, 'Đã nộp', 30);

-- User 8: 25 + 55 = 80
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (8, 3, 'Product Owner', 25),
    (8, 4, 'Khá ổn...', 55);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (8, 2, 'Đã nộp', 80);

-- === ASSIGNMENT 3 (User 8,9,10,11,12) ===
-- User 8: 30 + 60 = 90
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (8, 5, 'Cuối Sprint', 30),
    (
        8,
        6,
        'Giao tiếp, Code, Test',
        60
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (8, 3, 'Đã nộp', 90);

-- User 9: 15 + 40 = 55
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (9, 5, 'Đầu Sprint', 15),
    (9, 6, 'Không có ý kiến', 40);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (9, 3, 'Đã nộp', 55);

-- User 10: 30 + 68 = 98
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (10, 5, 'Cuối Sprint', 30),
    (
        10,
        6,
        'Phân tích rất sâu...',
        68
    );

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (10, 3, 'Đã nộp', 98);

-- User 11: 20 + 50 = 70
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (11, 5, 'Giữa Sprint', 20),
    (11, 6, 'Cần họp ít hơn', 50);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (11, 3, 'Đã nộp', 70);

-- User 12: 30 + 40 = 70
INSERT INTO
    "Answers" (
        user_id,
        question_id,
        answer_text,
        answer_score
    )
VALUES (12, 5, 'Cuối Sprint', 30),
    (12, 6, 'Tài liệu chưa rõ', 40);

INSERT INTO
    "Assignment_Submission" (
        user_id,
        assignment_id,
        submission_status,
        submission_score
    )
VALUES (12, 3, 'Đã nộp', 70);

-- 14. Thêm Hoạt động gần đây (Recent_Activitie)
INSERT INTO
    "Recent_Activitie" (
        user_id,
        activity_type,
        activity_detail
    )
VALUES (
        1,
        'Tạo bài tập',
        'Đã tạo bài tập: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    (
        2,
        'Tạo bài tập',
        'Đã tạo bài tập: Bài tập Slide 2: Product Backlog'
    ),
    (
        2,
        'Tạo bài tập',
        'Đã tạo bài tập: Bài tập Slide 3: Sprint 1 Report'
    );

-- Hoạt động của HS (Nộp bài tập)
INSERT INTO
    "Recent_Activitie" (
        user_id,
        activity_type,
        activity_detail
    )
VALUES
    -- Ass 1
    (
        3,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    (
        4,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    (
        5,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    (
        6,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    (
        7,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 1: Đặc tả yêu cầu'
    ),
    -- Ass 2
    (
        4,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 2: Product Backlog'
    ),
    (
        5,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 2: Product Backlog'
    ),
    (
        6,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 2: Product Backlog'
    ),
    (
        7,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 2: Product Backlog'
    ),
    (
        8,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 2: Product Backlog'
    ),
    -- Ass 3
    (
        8,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 3: Sprint 1 Report'
    ),
    (
        9,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 3: Sprint 1 Report'
    ),
    (
        10,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 3: Sprint 1 Report'
    ),
    (
        11,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 3: Sprint 1 Report'
    ),
    (
        12,
        'Nộp bài tập',
        'Đã nộp bài cho: Bài tập Slide 3: Sprint 1 Report'
    );

-- 15. Dữ liệu Translation QUAN TRỌNG: Bảng này chỉ tồn tại ở AI Service, không có ở Main Server nên ta bỏ qua phần insert này.