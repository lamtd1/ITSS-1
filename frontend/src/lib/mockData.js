export const MOCK_DATA = {
  currentUser: {
    admin: { id: 1, name: "Admin", email: "admin@kakehashi.com", role: "admin", avatar: "A" },
    student: { id: 2, name: "Nguyen Van B", email: "student@kakehashi.com", role: "student", avatar: "B" }
  },
  stats: {
    slides: 30,
    assignments: 30,
    students: 60
  },
  students: [
    { id: 1, name: "Nguyen Van A", email: "nguyenvana@gmail.com", progress: 84, status: "online", code: "NVA" },
    { id: 2, name: "Tran Thi C", email: "tranthic@gmail.com", progress: 45, status: "offline", code: "TTC" },
    { id: 3, name: "Le Van D", email: "levand@gmail.com", progress: 92, status: "online", code: "LVD" },
  ],
  slides: [
    { id: 1, title: "第1課：入門", date: "2023-10-01", status: "unread" },
    { id: 2, title: "第2課：基本文法", date: "2023-10-05", status: "read" },
    { id: 3, title: "第3課：日本文化", date: "2023-10-10", status: "read" },
  ],
  studentAssignments: [
    { id: 1, title: "文法チェック N5", remainingTime: "45分", deadline: "2023/11/20", progress: 0, status: "todo", totalPoints: 100 },
    { id: 2, title: "語彙テスト 第1-5課", remainingTime: "30分", deadline: "2023/11/15", progress: 84, status: "doing", totalPoints: 50 },
    { id: 3, title: "聴解練習", remainingTime: "60分", deadline: "2023/11/10", progress: 100, status: "done", totalPoints: 100 },
  ],
  dictionaryHistory: [
    { id: 1, word: "こんにちは", meaning: "Xin chào" },
    { id: 2, word: "学生", meaning: "Học sinh" },
    { id: 3, word: "課題", meaning: "Bài tập" },
  ],
  flashcards: [
    { id: 1, title: "会社の語彙", count: 20, progress: 45 },
    { id: 2, title: "漢字 N4", count: 50, progress: 10 },
    { id: 3, title: "動詞グループ1", count: 15, progress: 0 },
  ]
};