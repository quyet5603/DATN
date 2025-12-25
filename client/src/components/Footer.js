import React from 'react'

export const Footer = () => {

    const footerNav = ["Việc làm","Đăng nhập","Đăng ký","Đăng việc"]

    return (
        <footer class="bg-gray-50 rounded-lg shadow-lg mt-12">
            <div class="w-full max-w-screen-xl mx-auto p-6 md:py-8">
                <div class="flex flex-col items-center justify-center">
                    <ul class="flex flex-wrap justify-center items-center mb-4 text-sm font-medium text-gray-600 gap-4 md:gap-6">
                        {
                            footerNav.map( (menu, key)=> {
                                return (
                                    <li key={key}>
                                        <a href="#" class="hover:text-primary hover:underline transition-colors">{menu}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </footer>

    )
}
