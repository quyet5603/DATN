import React from 'react';
import { Link } from 'react-router-dom';

export const CVGuide = () => {
    return (
        <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hướng dẫn Viết CV</h1>
                    <Link
                        to="/cv/manager"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        ← Quay lại Quản lý CV
                    </Link>
                </div>

                <div className="prose max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Cấu trúc CV chuẩn</h2>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div>
                                <h3 className="font-semibold text-gray-700">1. Thông tin cá nhân</h3>
                                <ul className="list-disc list-inside text-gray-600 text-sm ml-4">
                                    <li>Họ và tên</li>
                                    <li>Số điện thoại</li>
                                    <li>Email</li>
                                    <li>Địa chỉ</li>
                                    <li>LinkedIn, GitHub (nếu có)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">2. Mục tiêu nghề nghiệp</h3>
                                <p className="text-gray-600 text-sm ml-4">
                                    Viết ngắn gọn 2-3 câu về mục tiêu nghề nghiệp và định hướng của bạn
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">3. Học vấn</h3>
                                <ul className="list-disc list-inside text-gray-600 text-sm ml-4">
                                    <li>Tên trường, ngành học</li>
                                    <li>Thời gian học (từ - đến)</li>
                                    <li>GPA/Xếp loại (nếu tốt)</li>
                                    <li>Thành tích nổi bật</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">4. Kinh nghiệm làm việc</h3>
                                <ul className="list-disc list-inside text-gray-600 text-sm ml-4">
                                    <li>Tên công ty, vị trí</li>
                                    <li>Thời gian làm việc</li>
                                    <li>Mô tả công việc và thành tựu (dùng số liệu cụ thể)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">5. Kỹ năng</h3>
                                <ul className="list-disc list-inside text-gray-600 text-sm ml-4">
                                    <li>Kỹ năng chuyên môn</li>
                                    <li>Kỹ năng mềm</li>
                                    <li>Ngôn ngữ lập trình, công nghệ</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">6. Dự án / Sản phẩm</h3>
                                <ul className="list-disc list-inside text-gray-600 text-sm ml-4">
                                    <li>Tên dự án</li>
                                    <li>Công nghệ sử dụng</li>
                                    <li>Mô tả ngắn gọn</li>
                                    <li>Link demo/GitHub (nếu có)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="flex gap-4 pt-4">
                        <Link
                            to="/cv/upload"
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Tải CV lên ngay
                        </Link>
                        <Link
                            to="/cv/manager"
                            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Quản lý CV
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

