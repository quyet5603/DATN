import React, { useState, useContext, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { LoginContext } from '../components/ContextProvider/Context.js';
import 'boxicons';

const employerNavItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Đăng việc', path: '/post-job' },
    { label: 'Bảng điều khiển', path: '/all-jobs' },
    { label: 'Thống kê', path: '/employer/dashboard' },
    { label: 'Ứng viên', path: '/shortlist' },
];
const candidateNavItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tất cả việc làm', path: '/all-posted-jobs' },
    { label: 'Việc làm gợi ý', path: '/recommended-jobs' },
    { label: 'Bảng điều khiển', path: `/my-jobs` }
];

export const Navbar = () => {

    const [loginData, setLoginData] = useState();

    const [navItems, setNavItems] = useState([
        { label: 'Trang chủ', path: '/' },
        { label: 'Tất cả việc làm', path: '/all-posted-jobs' },
    ]
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handlerIsMenuOpen = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        // Load user data from localStorage on mount
        const loadUserData = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setLoginData(user);
                } else {
                    setLoginData(null);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                setLoginData(null);
            }
        };
        
        loadUserData();

        // Listen for storage changes (when user logs in from another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'usertoken') {
                loadUserData();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also check on focus (when user switches back to this tab)
        const handleFocus = () => {
            loadUserData();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [])

    useEffect(() => {
        

        if (loginData) {
            const role = loginData.role;

            if (role === "employer") {
                setNavItems(employerNavItems)
            }
            else if (role === "candidate") {
                setNavItems(candidateNavItems)
            }
        }
    }, [loginData])


    const logoutHandler = async () => {
        try {
            await fetch('http://localhost:8080/auth/logout', {
                method: "POST",
            })
                .then((res) => res.json())
                .then((result) => {
                    // Clear all auth data
                    setLoginData(null)
                    localStorage.removeItem("usertoken")
                    localStorage.removeItem("user") // Also remove user data
                    
                    // Reload to ensure clean state
                    window.location.href = "/";
                })
        } catch (error) {
            console.error("Logout error:", error);
            // Still clear data even if API call fails
            setLoginData(null)
            localStorage.removeItem("usertoken")
            localStorage.removeItem("user")
            window.location.href = "/";
        }
    }

    return (

        <div className='max-w-screen container mx-auto xl:px-24 px-4'>

            <nav className='flex items-center py-6 relative'>
                {/* MAIN MENU - Lg device - Centered */}
                {
                    navItems &&
                    <ul className="hidden md:flex gap-8 font-bold mx-auto">
                        {navItems.map(({ label, path }) => (
                            <li key={path} className='text-base text-primary'>
                                <NavLink
                                    to={path}
                                    className={({ isActive }) => isActive ? "active " : ""}
                                >
                                    <span>{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                }

                {/* Login/Logout buttons - Absolute right */}
                <div className='absolute right-0'>
                    {
                        localStorage.getItem("usertoken") ?
                            <div className='hidden md:flex items-center gap-4'>
                                <span className='text-base text-gray-700'>Xin chào, <span className='font-semibold'>{loginData && loginData.userName}</span></span>
                                <button onClick={logoutHandler} className='py-2 px-5 text-center border-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-md transition-colors'>Đăng xuất</button>
                            </div>
                            :
                            <div className='text-base text-primary font-medium space-x-4 hidden md:flex'>
                                <Link to="/login" className='py-2 px-6 border rounded-md bg-gray-100 hover:bg-gray-200 transition-colors'>Đăng nhập</Link>
                                <Link to="/signup" className='bg-secondary text-white py-2 px-6 border rounded-md hover:opacity-90 transition-opacity'>Đăng ký</Link>
                            </div>
                    }
                </div>

                {/* HAMBURGER MENU */}
                <div className="text-primary md:hidden flex justify-end items-center gap-2">
                    <box-icon name={isMenuOpen ? "x" : "menu"} size="md" color="text-primary" onClick={handlerIsMenuOpen}></box-icon>
                </div>


            </nav>

            {/* MAIN MENU sm device */}
            <div className={` ${isMenuOpen ? "" : "hidden"} font-bold px-4 bg-gray-200 py-5 rounded`}>
                <ul className="md:hidden sm:flex flex-col">
                    {isMenuOpen && navItems.map(({ label, path }) => (
                        <li key={path} className='text-base text-primary first:text-black py-1'>
                            <NavLink
                                to={path}
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                <span onClick={() => setIsMenuOpen(!isMenuOpen)}>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                    {/* Login/signup sm-device */}
                    <div>
                        {
                            localStorage.getItem("usertoken") ?
                                <div className='mt-3'>
                                    <span className='text-sm text-gray-700 block mb-2'>Xin chào, <span className='font-semibold'>{loginData && loginData.userName}</span></span>
                                    <button onClick={logoutHandler} className='w-full py-2 px-5 border rounded-md bg-gray-200 hover:bg-gray-300 transition-colors'>Đăng xuất</button>
                                </div>
                                :
                                <li onClick={() => setIsMenuOpen(!isMenuOpen)} className='mt-2'><Link to="/login" className='py-2 px-4 text-primary block border rounded-md hover:bg-gray-100 transition-colors'>Đăng nhập</Link></li>
                        }
                    </div>
                </ul>
            </div>


            <Outlet />
        </div>
    )
}

