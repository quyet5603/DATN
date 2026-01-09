import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext } from '../ContextProvider/Context';
import { toast } from 'react-toastify';

export const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setLoginData } = useContext(LoginContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');
        const message = searchParams.get('message');

        console.log('=== GOOGLE CALLBACK FRONTEND ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User param:', userParam ? 'Present' : 'Missing');
        console.log('Error:', error);
        console.log('Message:', message);

        if (error) {
            const errorMessages = {
                'no_email': 'Không thể lấy email từ tài khoản Google. Vui lòng thử lại.',
                'google_auth_failed': 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.',
                'server_error': message ? `Lỗi server: ${decodeURIComponent(message)}` : 'Lỗi server. Vui lòng thử lại sau.'
            };
            toast.error(errorMessages[error] || 'Đã xảy ra lỗi khi đăng nhập');
            navigate('/login', { replace: true });
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                console.log('User parsed successfully:', user.userEmail);
                
                // Clear old data first
                localStorage.removeItem("usertoken");
                localStorage.removeItem("user");
                
                // Set new data
                localStorage.setItem("usertoken", token);
                localStorage.setItem("user", JSON.stringify(user));

                // Update context
                setLoginData(user);
                toast.success("Đăng nhập bằng Google thành công!");
                
                // Redirect to home
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            } catch (err) {
                console.error('Error parsing user data:', err);
                console.error('User param value:', userParam);
                toast.error('Lỗi khi xử lý thông tin đăng nhập');
                navigate('/login', { replace: true });
            }
        } else {
            // Không có token hoặc user, redirect về login
            console.error('Missing token or user param');
            console.error('Token:', token);
            console.error('User param:', userParam);
            toast.error('Không nhận được thông tin đăng nhập. Vui lòng thử lại.');
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, setLoginData]);

    return (
        <div className='min-h-screen bg-teal-50 flex items-center justify-center'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
};
