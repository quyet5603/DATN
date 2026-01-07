import React, { useState } from 'react';
import { MatchDetailsCard } from '../components/AI/MatchDetailsCard';

/**
 * Trang test component MatchDetailsCard
 * Truy cập: http://localhost:3000/test-match-details
 */
export const TestMatchDetails = () => {
  // Dữ liệu mẫu để test
  const [sampleData] = useState({
    score: 85,
    label: "Phù hợp cao",
    location_match: {
      score: 20,
      cv_location: "Hà Nội",
      match_status: "perfect"
    },
    experience_match: {
      score: 30,
      cv_years: 5,
      required_years: 3,
      match_status: "exceeded"
    },
    skills_match: {
      score: 25,
      matched_skills: ["React", "JavaScript", "TypeScript", "Node.js"],
      missing_skills: ["Python", "Docker"]
    },
    education_match: {
      score: 10,
      cv_education: "Đại học Bách Khoa - Công nghệ thông tin"
    },
    match_reasons: [
      "Kinh nghiệm vượt yêu cầu (5 năm so với 3 năm yêu cầu)",
      "Địa điểm hoàn toàn phù hợp (Hà Nội)",
      "Có 4/6 kỹ năng chính yêu cầu"
    ],
    red_flags: [
      "Thiếu kỹ năng Python",
      "Chưa có kinh nghiệm với Docker"
    ]
  });

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧪 Test MatchDetailsCard Component
        </h1>
        <p className="text-gray-600">
          Component hiển thị chi tiết phân tích độ phù hợp CV với công việc
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Test với dữ liệu đầy đủ */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">✅ Test với dữ liệu đầy đủ (Score: 85)</h2>
          <MatchDetailsCard analysis={sampleData} />
        </div>

        {/* Test với điểm thấp */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">⚠️ Test với điểm thấp (Score: 35)</h2>
          <MatchDetailsCard 
            analysis={{
              score: 35,
              label: "Cần xem xét",
              location_match: {
                score: 0,
                cv_location: "TP.HCM",
                match_status: "poor"
              },
              experience_match: {
                score: 10,
                cv_years: 1,
                required_years: 3,
                match_status: "insufficient"
              },
              skills_match: {
                score: 15,
                matched_skills: ["JavaScript"],
                missing_skills: ["React", "TypeScript", "Node.js", "Docker", "Python"]
              },
              education_match: {
                score: 10,
                cv_education: "Cao đẳng FPT"
              },
              match_reasons: [
                "Có kiến thức JavaScript cơ bản"
              ],
              red_flags: [
                "Địa điểm không phù hợp (TP.HCM yêu cầu Hà Nội)",
                "Kinh nghiệm chưa đủ (1 năm so với 3 năm yêu cầu)",
                "Thiếu nhiều kỹ năng quan trọng"
              ]
            }} 
          />
        </div>

        {/* Test với dữ liệu không đầy đủ */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🔍 Test với dữ liệu thiếu (Score: 50)</h2>
          <MatchDetailsCard 
            analysis={{
              score: 50,
              label: "Phù hợp",
              location_match: {
                score: 10,
                match_status: "good"
              },
              experience_match: {
                score: 20,
                match_status: "close"
              },
              skills_match: {
                score: 20,
                matched_skills: [],
                missing_skills: []
              },
              education_match: {
                score: 0
              },
              match_reasons: [],
              red_flags: []
            }} 
          />
        </div>

        {/* Test với null */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">❌ Test với null (không hiển thị gì)</h2>
          <MatchDetailsCard analysis={null} />
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-lg mb-3">📊 Cấu trúc dữ liệu analysis:</h3>
        <pre className="bg-white p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(sampleData, null, 2)}
        </pre>
      </div>

      <div className="mt-6 p-6 bg-green-50 rounded-lg">
        <h3 className="font-bold text-lg mb-3">✅ Các tính năng đã test:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Hiển thị 4 tiêu chí: Địa điểm, Kinh nghiệm, Kỹ năng, Học vấn</li>
          <li>Badge status cho mỗi tiêu chí (perfect, exceeded, good, close, poor, etc.)</li>
          <li>Điểm số cho từng tiêu chí (/20, /30, /30, /20)</li>
          <li>Danh sách kỹ năng matched (màu xanh) và missing (màu đỏ)</li>
          <li>Tổng điểm /100 với gradient background</li>
          <li>Handle null/undefined data</li>
        </ul>
      </div>
    </div>
  );
};
