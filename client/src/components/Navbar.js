import React, { useState, useContext, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { LoginContext } from '../components/ContextProvider/Context.js';
import { NotificationDropdown } from './NotificationDropdown.js';
import 'boxicons';
import logoURL from '../assets/img/logo.png';

const employerNavItems = [
    { label: 'Hồ sơ công ty', path: '/profile' },
    { label: 'Tất cả việc làm', path: '/all-jobs' },
    { label: 'Đăng tin tuyển dụng', path: '/post-job' },
    { label: 'Quản lý CV', path: '/employer/cv-management' },
    { label: 'Thống kê', path: '/employer/dashboard' },
];
const candidateNavItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tất cả việc làm', path: '/all-posted-jobs' },
    { label: 'Hồ sơ cá nhân', path: '/cv/manager' },
    { label: 'Đơn ứng tuyển', path: `/my-jobs` }
];
const adminNavItems = [
    { label: 'Tổng quan', path: '/admin/dashboard' },
    { label: 'Quản Lý Người Dùng', path: '/admin/users' },
    { label: 'Quản Lý Công Việc', path: '/admin/jobs' },
    { label: 'Quản Lý Công Ty', path: '/admin/companies' },
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

            if (role === "admin") {
                setNavItems(adminNavItems)
            }
            else if (role === "employer") {
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
        <div>
            {/* Navbar với nền xanh */}
            <div className='bg-green-600'>
                <div className='max-w-screen container mx-auto xl:px-24 px-4'>
                    <nav className='flex items-center py-4 relative'>
                {/* LOGO - Bên trái */}
                <Link to="/" className="flex-shrink-0 w-12 md:w-16">
                    <img 
                        src={logoURL} 
                        alt="Logo" 
                        className="h-10 w-10 md:h-12 md:w-12 object-contain"
                    />
                </Link>
                
                {/* MAIN MENU - Lg device - Centered */}
                {
                    navItems &&
                    <ul className="hidden md:flex gap-4 md:gap-6 lg:gap-8 font-bold items-center justify-center flex-1 absolute left-1/2 transform -translate-x-1/2">
                        {navItems.map(({ label, path }) => (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    className={({ isActive }) => 
                                        isActive 
                                            ? "text-white border-b-2 border-white pb-2 px-3 py-2 text-lg font-semibold whitespace-nowrap" 
                                            : "text-white hover:text-green-100 transition-colors px-3 py-2 text-lg font-semibold whitespace-nowrap"
                                    }
                                >
                                    <span>{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                }

                {/* User Menu - Right side */}
                <div className='flex-shrink-0 ml-auto'>
                    {
                        localStorage.getItem("usertoken") ?
                            <div className='hidden md:flex items-center gap-4 avatar-dropdown-container relative'>
                                {/* Notification Bell */}
                                <NotificationDropdown />
                                
                                {/* Avatar with Dropdown */}
                                <div className='relative'>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className='flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full transition-all hover:opacity-80'
                                    >
                                        <div className='w-14 h-14 rounded-full overflow-hidden border-2 border-white hover:border-green-200 transition-colors cursor-pointer'>
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={loginData?.userName || 'Avatar'}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                    <box-icon name='user' size='36px' color='#6B7280'></box-icon>
                                                </div>
                                            )}
                                        </div>
                                        <box-icon
                                            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                            size='18px'
                                            color='#ffffff'
                                        ></box-icon>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn'>
                                            {/* User Info Header */}
                                            <div className='px-4 py-3 border-b border-gray-200'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200'>
                                                        {avatarUrl ? (
                                                            <img
                                                                src={avatarUrl}
                                                                alt={loginData?.userName || 'Avatar'}
                                                                className='w-full h-full object-cover'
                                                            />
                                                        ) : (
                                                            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                                <box-icon name='user' size='40px' color='#6B7280'></box-icon>
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
                                                    to={loginData?.role === 'admin' ? '/admin/dashboard' : '/profile'}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                >
                                                    <box-icon name='user' size='20px' color='#4B5563'></box-icon>
                                                    <span className='text-sm font-medium'>
                                                        {loginData?.role === 'employer' ? 'Hồ sơ công ty' : loginData?.role === 'admin' ? 'Tổng quan' : 'Tổng quan'}
                                                    </span>
                                                </Link>
                                                
                                                {loginData?.role === 'admin' && (
                                                    <>
                                                        <Link
                                                            to="/admin/users"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='user' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Quản lý người dùng</span>
                                                        </Link>
                                                        <Link
                                                            to="/admin/jobs"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='briefcase' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Quản lý công việc</span>
                                                        </Link>
                                                        <Link
                                                            to="/admin/companies"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='building' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Quản lý công ty</span>
                                                        </Link>
                                                    </>
                                                )}
                                                
                                                {loginData?.role === 'candidate' && (
                                                    <>
                                                        <Link
                                                            to="/cv/manager"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='file-blank' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Hồ sơ cá nhân</span>
                                                        </Link>
                                                        <Link
                                                            to="/my-jobs"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='briefcase' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Đơn ứng tuyển</span>
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
                                                            to="/employer/cv-management"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                                        >
                                                            <box-icon name='file-blank' size='20px' color='#4B5563'></box-icon>
                                                            <span className='text-sm font-medium'>Quản lý CV</span>
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

                                            {/* Change Password */}
                                            <Link
                                                to="/change-password"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                                            >
                                                <box-icon name='lock-alt' size='20px' color='#4B5563'></box-icon>
                                                <span className='text-sm font-medium'>Đổi mật khẩu</span>
                                            </Link>

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
                            <div className='text-base font-medium space-x-4 hidden md:flex bg-green-700 px-4 py-2 rounded'>
                                <Link to="/login" className='text-white hover:text-green-100 transition-colors'>Đăng nhập</Link>
                                <span className='text-white'>/</span>
                                <Link to="/signup" className='text-white hover:text-green-100 transition-colors'>Đăng ký</Link>
                            </div>
                    }
                </div>

                {/* HAMBURGER MENU */}
                <div className="md:hidden flex justify-end items-center gap-2">
                    <box-icon name={isMenuOpen ? "x" : "menu"} size="md" color="#ffffff" onClick={handlerIsMenuOpen}></box-icon>
                </div>


            </nav>

            {/* MAIN MENU sm device */}
            <div className={` ${isMenuOpen ? "" : "hidden"} font-bold px-4 bg-green-600 py-5 rounded`}>
                <ul className="md:hidden sm:flex flex-col">
                    {isMenuOpen && navItems.map(({ label, path }) => (
                        <li key={path} className='py-2'>
                            <NavLink
                                to={path}
                                className={({ isActive }) => 
                                    isActive 
                                        ? "text-white border-b-2 border-white pb-2 px-3 py-2 text-lg font-semibold block" 
                                        : "text-white hover:text-green-100 transition-colors px-3 py-2 text-lg font-semibold block"
                                }
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
                                        <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200'>
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={loginData?.userName || 'Avatar'}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                    <box-icon name='user' size='40px' color='#6B7280'></box-icon>
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
                                    
                                    <Link 
                                        to={loginData?.role === 'admin' ? '/admin/dashboard' : '/profile'} 
                                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                        className='block w-full py-2 px-5 mb-2 text-center border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-md transition-colors'
                                    >
                                        <div className='flex items-center justify-center gap-2'>
                                            <box-icon name='user' size='18px' color='currentColor'></box-icon>
                                            <span>{loginData?.role === 'employer' ? 'Hồ sơ công ty' : 'Tổng quan'}</span>
                                        </div>
                                    </Link>
                                    
                                    {loginData?.role === 'admin' && (
                                        <>
                                            <Link to="/admin/users" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='user' size='18px' color='#4B5563'></box-icon>
                                                    <span>Quản lý người dùng</span>
                                                </div>
                                            </Link>
                                            <Link to="/admin/jobs" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='briefcase' size='18px' color='#4B5563'></box-icon>
                                                    <span>Quản lý công việc</span>
                                                </div>
                                            </Link>
                                            <Link to="/admin/companies" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='building' size='18px' color='#4B5563'></box-icon>
                                                    <span>Quản lý công ty</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    
                                    {loginData?.role === 'candidate' && (
                                        <>
                                            <Link to="/cv/manager" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='file-blank' size='18px' color='#4B5563'></box-icon>
                                                    <span>Hồ sơ cá nhân</span>
                                                </div>
                                            </Link>
                                            <Link to="/my-jobs" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='briefcase' size='18px' color='#4B5563'></box-icon>
                                                    <span>Đơn ứng tuyển</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    
                                    {loginData?.role === 'employer' && (
                                        <>
                                            <Link to="/all-jobs" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='briefcase' size='18px' color='#4B5563'></box-icon>
                                                    <span>Quản lý việc làm</span>
                                                </div>
                                            </Link>
                                            <Link to="/employer/cv-management" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='file-blank' size='18px' color='#4B5563'></box-icon>
                                                    <span>Quản lý CV</span>
                                                </div>
                                            </Link>
                                            <Link to="/employer/dashboard" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <box-icon name='bar-chart-alt-2' size='18px' color='#4B5563'></box-icon>
                                                    <span>Thống kê</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    
                                    <Link to="/change-password" onClick={() => setIsMenuOpen(!isMenuOpen)} className='block w-full py-2 px-5 mb-2 text-center border border-gray-300 hover:bg-gray-100 rounded-md transition-colors'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <box-icon name='lock-alt' size='18px' color='#4B5563'></box-icon>
                                            <span>Đổi mật khẩu</span>
                                        </div>
                                    </Link>
                                    
                                    <button onClick={logoutHandler} className='w-full py-2 px-5 border rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <box-icon name='log-out' size='18px' color='#DC2626'></box-icon>
                                            <span>Đăng xuất</span>
                                        </div>
                                    </button>
                                </div>
                                :
                                <li onClick={() => setIsMenuOpen(!isMenuOpen)} className='mt-2'><Link to="/login" className='py-2 px-4 text-white block border border-white rounded-md hover:bg-green-700 transition-colors'>Đăng nhập</Link></li>
                        }
                    </div>
                </ul>
                    </div>
                </div>
            </div>

            {/* Content - không có nền xanh */}
            <Outlet />
        </div>
    )
}

