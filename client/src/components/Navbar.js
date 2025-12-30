import React, { useState, useContext, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { LoginContext } from '../components/ContextProvider/Context.js';
import 'boxicons';
import logoURL from '../assets/img/logo.png';

const employerNavItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Đăng việc', path: '/post-job' },
    { label: 'Tất cả việc làm', path: '/all-jobs' },
    { label: 'Thống kê', path: '/employer/dashboard' },
    { label: 'Ứng viên', path: '/shortlist' },
];
const candidateNavItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tất cả việc làm', path: '/all-posted-jobs' },
    { label: 'Việc làm gợi ý', path: '/recommended-jobs' },
    { label: 'Đơn ứng tuyển', path: `/my-jobs` }
];

export const Navbar = () => {

    const [loginData, setLoginData] = useState();
    const [avatarUrl, setAvatarUrl] = useState(null);

    const [navItems, setNavItems] = useState([
        { label: 'Trang chủ', path: '/' },
        { label: 'Tất cả việc làm', path: '/all-posted-jobs' },
    ]
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handlerIsMenuOpen = () => setIsMenuOpen(!isMenuOpen);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Load user data from localStorage on mount
        const loadUserData = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setLoginData(user);
                    
                    // Load avatar URL
                    if (user.avatar) {
                        setAvatarUrl(`http://localhost:8080/uploads/${user.avatar}`);
                    } else {
                        setAvatarUrl(null);
                    }
                } else {
                    setLoginData(null);
                    setAvatarUrl(null);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                setLoginData(null);
                setAvatarUrl(null);
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
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.avatar-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen])

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
                {/* LOGO - Bên trái */}
                <Link to="/" className="flex-shrink-0 mr-4 md:mr-8">
                    <img 
                        src={logoURL} 
                        alt="Logo" 
                        className="h-10 w-10 md:h-12 md:w-12 object-contain"
                    />
                </Link>
                
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

                {/* User Menu - Absolute right */}
                <div className='absolute right-0'>
                    {
                        localStorage.getItem("usertoken") ?
                            <div className='hidden md:flex items-center gap-4 avatar-dropdown-container relative'>
                                {/* Avatar with Dropdown */}
                                <div className='relative'>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className='flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full transition-all hover:opacity-80'
                                    >
                                        <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-secondary transition-colors'>
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={loginData?.userName || 'Avatar'}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                    <box-icon name='user' size='24px' color='#6B7280'></box-icon>
                                                </div>
                                            )}
                                        </div>
                                        <box-icon
                                            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                            size='16px'
                                            color='#6B7280'
                                        ></box-icon>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn'>
                                            {/* User Info Header */}
                                            <div className='px-4 py-3 border-b border-gray-200'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200'>
                                                        {avatarUrl ? (
                                                            <img
                                                                src={avatarUrl}
                                                                alt={loginData?.userName || 'Avatar'}
                                                                className='w-full h-full object-cover'
                                                            />
                                                        ) : (
                                                            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                                <box-icon name='user' size='28px' color='#6B7280'></box-icon>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='font-semibold text-gray-800 truncate'>
                                                            {loginData?.userName || 'Người dùng'}
                                                        </p>
                                                        <p className='text-sm text-gray-500 truncate'>
                                                            {loginData?.userEmail || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className='py-1'>
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                >
                                                    <box-icon name='user' size='20px' color='#4B5563'></box-icon>
                                                    <span className='text-sm font-medium'>Hồ sơ của tôi</span>
                                                </Link>
                                                
                                                {loginData?.role === 'candidate' && (
                                                    <>
                                                        <Link
                                                            to="/my-jobs"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='briefcase' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Đơn ứng tuyển</span>
                                                        </Link>
                                                        <Link
                                                            to="/recommended-jobs"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='star' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Việc làm gợi ý</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {loginData?.role === 'employer' && (
                                                    <>
                                                        <Link
                                                            to="/all-jobs"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='briefcase' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Quản lý việc làm</span>
                                                        </Link>
                                                        <Link
                                                            to="/employer/dashboard"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='bar-chart-alt-2' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Thống kê</span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div className='border-t border-gray-200 my-1'></div>

                                            {/* Logout */}
                                            <div className='py-1'>
                                                <button
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        logoutHandler();
                                                    }}
                                                    className='w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left'
                                                >
                                                    <box-icon name='log-out' size='20px' color='#DC2626'></box-icon>
                                                    <span className='text-sm font-medium'>Đăng xuất</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                    {/* Mobile User Info */}
                                    <div className='flex items-center gap-3 mb-3 pb-3 border-b border-gray-300'>
                                        <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200'>
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={loginData?.userName || 'Avatar'}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                    <box-icon name='user' size='28px' color='#6B7280'></box-icon>
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-gray-800 truncate text-sm'>
                                                {loginData?.userName || 'Người dùng'}
                                            </p>
                                            <p className='text-xs text-gray-500 truncate'>
                                                {loginData?.userEmail || ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Link to="/profile" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-md transition-colors'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <box-icon name='user' size='18px' color='currentColor'></box-icon>
                                            <span>Hồ sơ của tôi</span>
                                        </div>
                                    </Link>
                                    
                                    {loginData?.role === 'candidate' && (
                                        <>
                                            <Link to="/my-jobs" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='briefcase' size='18px' color='#4B5563'></box-icon>
                                                    <span>Đơn ứng tuyển</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    
                                    <button onClick={logoutHandler} className='w-full py-2 px-5 border rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <box-icon name='log-out' size='18px' color='#DC2626'></box-icon>
                                            <span>Đăng xuất</span>
                                        </div>
                                    </button>
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

