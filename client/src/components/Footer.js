import React from 'react'

export const Footer = () => {
    return (
        <footer className="bg-gray-50 rounded-lg shadow-lg mt-12">
            <div className="w-full max-w-screen-xl mx-auto p-6 md:py-8">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-500 text-center">
                        © {new Date().getFullYear()} Hệ thống hỗ trợ tuyển dụng. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
