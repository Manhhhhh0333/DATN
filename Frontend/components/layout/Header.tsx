"use client";

import Link from "next/link";
import { authService } from "@/lib/auth";
import { useState, useEffect } from "react";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              汉语
            </div>
            <span className="text-xl font-bold text-dark">HiHSK</span>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Trang chủ
            </Link>
            <Link
              href="/courses"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Giáo trình HSK
            </Link>
            <Link
              href="/vocabulary"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Từ vựng
            </Link>
            <Link
              href="/practice"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Luyện tập
            </Link>
            <Link
              href="/tests"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Đề thi thử
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary transition font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    authService.logout();
                    setIsAuthenticated(false);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary transition font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Trang chủ
              </Link>
              <Link
                href="/courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Giáo trình HSK
              </Link>
              <Link
                href="/vocabulary"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Từ vựng
              </Link>
              <Link
                href="/practice"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Luyện tập
              </Link>
              <Link
                href="/tests"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Đề thi thử
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-700 hover:text-primary transition font-medium px-2 py-1"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        authService.logout();
                        setIsAuthenticated(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-700 hover:text-primary transition font-medium px-2 py-1"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

