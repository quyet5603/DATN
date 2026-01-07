import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';

export const CVUploadManager = () => {
    const { loginData } = useContext(LoginContext);
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [cvName, setCvName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('usertoken');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            toast.error('Vui lòng đăng nhập');
            navigate('/login');
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
                toast.error('Vui lòng chọn file PDF');
                return;
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
                return;
            }

            setFile(selectedFile);
            // Tự động đặt tên CV từ tên file
            if (!cvName) {
                setCvName(selectedFile.name.replace('.pdf', ''));
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Vui lòng chọn file CV');
            return;
        }

        if (!cvName.trim()) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('usertoken');
            const formData = new FormData();
            formData.append('cv', file);
            formData.append('cvName', cvName);
            formData.append('isDefault', isDefault);

            const response = await fetch('http://localhost:8080/api/cv/upload', {
                method: 'POST',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('CV đã được tải lên thành công!');
                navigate('/cv/manager');
            } else {
                toast.error(data.error || 'Không thể tải CV lên');
            }
        } catch (error) {
            console.error('Error uploading CV:', error);
            toast.error('Có lỗi xảy ra khi tải CV lên');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Tải CV lên</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên CV <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={cvName}
                            onChange={(e) => setCvName(e.target.value)}
                            placeholder="VD: CV Frontend Developer"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn file CV (PDF) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {file && (
                            <p className="mt-2 text-sm text-gray-600">
                                Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                            Đặt làm CV mặc định
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleUpload}
                            disabled={!file || !cvName.trim() || loading}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Đang tải lên...' : 'Tải CV lên'}
                        </button>
                        <button
                            onClick={() => navigate('/cv/manager')}
                            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">💡 Lưu ý:</h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Chỉ chấp nhận file PDF</li>
                            <li>Kích thước tối đa: 10MB</li>
                            <li>CV mặc định sẽ được sử dụng khi ứng tuyển và phân tích AI</li>
                            <li>Bạn có thể tải nhiều CV và chọn CV phù hợp cho từng công việc</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};











