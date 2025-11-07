"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { courseService } from "@/lib/services/courseService";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { authService } from "@/lib/auth";
import { CourseListDto } from "@/types";
import { ReviewStatsDto, VocabularyTopicDto } from "@/types";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [vocabularyStats, setVocabularyStats] = useState<ReviewStatsDto | null>(null);
  const [topics, setTopics] = useState<VocabularyTopicDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load courses
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);

        // Load vocabulary stats
        try {
          const statsData = await vocabularyService.getOverallStats();
          setVocabularyStats(statsData);
        } catch (error) {
          console.log("Chưa có dữ liệu vocabulary stats");
        }

        // Load vocabulary topics (lấy 6 topics đầu tiên)
        try {
          const topicsData = await vocabularyService.getAllTopics();
          setTopics(topicsData.slice(0, 6));
        } catch (error) {
          console.log("Chưa có dữ liệu vocabulary topics");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };
  const hskLevels = [
    { 
      level: "HSK 1", 
      words: "150 từ", 
      description: "Cấp độ cơ bản nhất cho người mới bắt đầu",
      color: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    { 
      level: "HSK 2", 
      words: "300 từ", 
      description: "Giao tiếp cơ bản trong cuộc sống hàng ngày",
      color: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    { 
      level: "HSK 3", 
      words: "600 từ", 
      description: "Giao tiếp hàng ngày một cách tự nhiên",
      color: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200"
    },
    { 
      level: "HSK 4", 
      words: "1,200 từ", 
      description: "Giao tiếp lưu loát về nhiều chủ đề",
      color: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200"
    },
    { 
      level: "HSK 5", 
      words: "2,500 từ", 
      description: "Đọc báo, xem phim và hiểu văn hóa",
      color: "from-red-50 to-pink-50",
      borderColor: "border-red-200"
    },
    { 
      level: "HSK 6", 
      words: "5,000 từ", 
      description: "Thành thạo như người bản ngữ",
      color: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200"
    },
  ];

  const features = [
    {
      icon: "📚",
      title: "Từ vựng theo chủ đề",
      description: "Học từ vựng hiệu quả với Flashcard thông minh và hệ thống lặp lại ngắt quãng (SRS)",
      link: "/vocabulary",
      available: true,
    },
    {
      icon: "🎓",
      title: "Giáo trình HSK",
      description: "Học theo chuẩn HSK quốc tế từ cấp độ 1 đến 6 với 150 bài học",
      link: "/courses",
      available: true,
    },
    {
      icon: "🎧",
      title: "Luyện nghe",
      description: "Cải thiện kỹ năng nghe với audio chuẩn giọng người bản ngữ",
      link: "#",
      available: false,
    },
    {
      icon: "✍️",
      title: "Luyện viết",
      description: "Luyện viết chữ Hán với hướng dẫn chi tiết từng nét bút",
      link: "#",
      available: false,
    },
    {
      icon: "📝",
      title: "Đề thi thử",
      description: "Thi thử HSK với đề thi chuẩn và chấm điểm tự động",
      link: "#",
      available: false,
    },
    {
      icon: "📊",
      title: "Theo dõi tiến độ",
      description: "Theo dõi tiến độ học tập và điểm số một cách chi tiết",
      link: "/dashboard",
      available: isAuthenticated,
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn An",
      role: "Học viên HSK 4",
      content: "HiHSK giúp mình cải thiện rất nhiều. Từ vựng học rất dễ nhớ và bài tập đa dạng.",
      avatar: "👤",
    },
    {
      name: "Trần Thị Bình",
      role: "Học viên HSK 3",
      content: "Mình thích cách học với flashcard và quiz. Giao diện đẹp, dễ sử dụng.",
      avatar: "👤",
    },
    {
      name: "Lê Minh Cường",
      role: "Học viên HSK 5",
      content: "Đề thi thử rất sát với đề thật. Mình đã đậu HSK 5 nhờ luyện tập ở đây!",
      avatar: "👤",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-light via-primary to-primary-dark py-20 md:py-32 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Học tiếng Trung online miễn phí
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
                Luyện thi HSK hiệu quả từ cấp độ 1 đến 6
              </p>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Nền tảng học tập thông minh với Flashcard, Quiz và đề thi thử giúp bạn nắm vững tiếng Trung một cách nhanh chóng
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Học ngay miễn phí
                </Link>
                <Link
                  href="/courses"
                  className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-white/10 transition shadow-lg"
                >
                  Xem khóa học
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                Tính năng nổi bật
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Công cụ học tập đa dạng và hiện đại giúp bạn tiến bộ nhanh chóng
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const content = (
                  <div
                    className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                      feature.available ? "border-gray-100 cursor-pointer" : "border-gray-200 opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{feature.icon}</div>
                      {feature.available ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                          Đã có
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">
                          Sắp ra mắt
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    {feature.available && feature.link !== "#" && (
                      <div className="text-blue-600 font-semibold text-sm">
                        Khám phá ngay →
                      </div>
                    )}
                  </div>
                );

                return feature.available && feature.link !== "#" ? (
                  <Link key={index} href={feature.link}>
                    {content}
                  </Link>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Stats Section - Chỉ hiển thị khi đã đăng nhập */}
        {isAuthenticated && vocabularyStats && (
          <section className="py-16 md:py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                  Tiến độ học tập của bạn
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Theo dõi số lượng từ vựng bạn đã học và cần ôn tập
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {vocabularyStats.newWords}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Chưa học</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {vocabularyStats.learningWords}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Đang học</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {vocabularyStats.masteredWords}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Đã thuộc</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {vocabularyStats.wordsDueToday}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Cần ôn hôm nay</div>
                </div>
              </div>
              {vocabularyStats.wordsDueToday > 0 && (
                <div className="text-center mt-8">
                  <Link
                    href="/vocabulary/review"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ôn tập ngay ({vocabularyStats.wordsDueToday} từ)
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Vocabulary Topics Preview */}
        {isAuthenticated && topics.length > 0 && (
          <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                    Từ vựng theo chủ đề
                  </h2>
                  <p className="text-xl text-gray-600">
                    Học từ vựng theo chủ đề với Flashcard và SRS
                  </p>
                </div>
                <Link
                  href="/vocabulary"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition"
                >
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/vocabulary/${topic.id}`}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-dark mb-2">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {topic.wordCount} từ vựng
                      </span>
                      <span className="text-blue-600 text-sm font-medium">Học ngay →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HSK Levels Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                Các cấp độ HSK
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Chọn cấp độ phù hợp với trình độ của bạn và bắt đầu hành trình chinh phục tiếng Trung
              </p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const hskData = hskLevels.find(
                    (h) => h.level === `HSK ${course.hskLevel}`
                  ) || hskLevels[0];
                  
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className={`bg-gradient-to-br ${hskData.color} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 ${hskData.borderColor}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-dark">
                          {course.title}
                        </h3>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {course.totalLessons} bài
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                      {course.progressPercentage > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Tiến độ</span>
                            <span className="font-semibold">
                              {course.progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${course.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="inline-flex items-center text-primary font-semibold hover:text-primary-dark transition group">
                        {course.progressPercentage > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                        <svg
                          className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hskLevels.map((hsk, index) => {
                  // Link đến vocabulary cho HSK1, courses cho các level khác
                  const hskLevel = index + 1; // HSK 1 = index 0 + 1
                  const linkUrl = hskLevel === 1 ? `/vocabulary/1` : `/courses`;
                  
                  return (
                    <Link
                      key={index}
                      href={linkUrl}
                      className={`bg-gradient-to-br ${hsk.color} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 ${hsk.borderColor} block`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-dark">
                          {hsk.level}
                        </h3>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {hsk.words}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">{hsk.description}</p>
                      <div className="inline-flex items-center text-primary font-semibold hover:text-primary-dark transition group">
                        {hskLevel === 1 ? "Xem từ vựng" : "Bắt đầu học"}
                        <svg
                          className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                Đánh giá từ học viên
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Cùng xem học viên nói gì về HiHSK
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex text-primary mt-4">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary-dark via-primary to-primary-light">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu hành trình học tiếng Trung?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn học viên đang học tập và tiến bộ mỗi ngày với HiHSK
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Đăng ký miễn phí ngay
              </Link>
              <Link
                href="/courses"
                className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-white/10 transition"
              >
                Xem các khóa học
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
