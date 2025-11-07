// API endpoints constants
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
  },
  
  // Courses
  COURSES: {
    BASE: "/api/courses",
    BY_ID: (id: number) => `/api/courses/${id}`,
  },
  
  // Lessons
  LESSONS: {
    BASE: "/api/lessons",
    BY_ID: (id: number) => `/api/lessons/${id}`,
    BY_COURSE: (courseId: number) => `/api/lessons/course/${courseId}`,
    BY_HSK_LEVEL: (hskLevel: number) => `/api/lessons/hsk/${hskLevel}`,
  },
  
  // Words
  WORDS: {
    BASE: "/api/words",
    BY_ID: (id: number) => `/api/words/${id}`,
    BY_LESSON: (lessonId: number) => `/api/lessons/${lessonId}/words`,
  },
  
  // Questions
  QUESTIONS: {
    BASE: "/api/questions",
    BY_ID: (id: number) => `/api/questions/${id}`,
    BY_LESSON: (lessonId: number) => `/api/lessons/${lessonId}/questions`,
  },
  
  // Progress
  PROGRESS: {
    LESSON: {
      BASE: "/api/progress/lessons",
      BY_LESSON: (lessonId: number) => `/api/progress/lessons/${lessonId}`,
    },
    WORD: {
      BASE: "/api/progress/words",
      BY_WORD: (wordId: number) => `/api/progress/words/${wordId}`,
    },
  },
  
  // Vocabulary Topics
  VOCABULARY_TOPICS: {
    BASE: "/api/vocabularytopics",
    BY_ID: (id: number) => `/api/vocabularytopics/${id}`,
    REVIEW_WORDS: (id: number, onlyDue?: boolean, limit?: number) => {
      const params = new URLSearchParams();
      if (onlyDue !== undefined) params.append("onlyDue", onlyDue.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      return `/api/vocabularytopics/${id}/review-words?${params.toString()}`;
    },
    STATS: (id: number) => `/api/vocabularytopics/${id}/stats`,
    OVERALL_STATS: "/api/vocabularytopics/stats/overall",
    REVIEW_DUE: (topicId?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (topicId !== undefined) params.append("topicId", topicId.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      return `/api/vocabularytopics/review/due?${params.toString()}`;
    },
    UPDATE_REVIEW: "/api/vocabularytopics/review",
  },
};

