import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export const CVScoreDetail = () => {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [scoreData, setScoreData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('usertoken');
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            navigate('/login');
            return;
        }

        fetchCVScore();
    }, [cvId, navigate]);

    const fetchCVScore = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`http://localhost:8080/api/cv/score/${cvId}/analyze`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setScoreData(data.data);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Không thể tải điểm CV');
            }
        } catch (error) {
            console.error('Error fetching CV score:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeCV = async () => {
        setAnalyzing(true);
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`http://localhost:8080/api/cv/analyze-score/${cvId}`, {
                method: 'POST',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Phân tích CV thành công!');
                setScoreData({
                    ...scoreData,
                    analysis: data.data.score,
                    cvAnalysis: data.data.analysis
                });
            } else {
                const error = await response.json();
                toast.error(error.error || 'Không thể phân tích CV');
            }
        } catch (error) {
            console.error('Error analyzing CV:', error);
            toast.error('Có lỗi xảy ra khi phân tích CV');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
                <div className="text-center">Đang tải...</div>
            </div>
        );
    }

    if (!scoreData) {
        return (
            <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
                <div className="text-center">Không tìm thấy dữ liệu CV</div>
            </div>
        );
    }

    const { cvName, analysis, cvAnalysis } = scoreData;
    const hasAnalysis = analysis && cvAnalysis;

    return (
        <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Link to="/cv/manager" className="text-blue-600 hover:underline mb-2 inline-block">
                            ← Quay lại danh sách CV
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{cvName}</h1>
                    </div>
                    {!hasAnalysis && (
                        <button
                            onClick={handleAnalyzeCV}
                            disabled={analyzing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {analyzing ? '🤖 Đang phân tích...' : '🤖 Phân tích CV với AI'}
                        </button>
                    )}
                </div>

                {!hasAnalysis ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-gray-600 text-lg mb-4">CV chưa được phân tích</p>
                        <p className="text-gray-500 mb-6">
                            Nhấn nút "Phân tích CV với AI" để hệ thống tự động đánh giá và chấm điểm CV của bạn
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Score Overview */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
                            <div className="text-center">
                                <div className="text-6xl font-bold mb-2">
                                    {analysis.totalScore}
                                    <span className="text-3xl">/100</span>
                                </div>
                                <div className="text-2xl mb-2">
                                    {analysis.grade.emoji} {analysis.grade.label}
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-4 mt-4">
                                    <div
                                        className="bg-white h-4 rounded-full transition-all duration-500"
                                        style={{ width: `${analysis.totalScore}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="bg-white border rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Chi tiết điểm số</h2>
                            <div className="space-y-4">
                                <ScoreItem
                                    label="Kỹ năng"
                                    score={analysis.breakdown.skillsScore}
                                    maxScore={25}
                                    color="bg-blue-500"
                                />
                                <ScoreItem
                                    label="Kinh nghiệm"
                                    score={analysis.breakdown.experienceScore}
                                    maxScore={30}
                                    color="bg-green-500"
                                />
                                <ScoreItem
                                    label="Học vấn"
                                    score={analysis.breakdown.educationScore}
                                    maxScore={20}
                                    color="bg-yellow-500"
                                />
                                <ScoreItem
                                    label="Điểm mạnh"
                                    score={analysis.breakdown.strengthsScore}
                                    maxScore={15}
                                    color="bg-purple-500"
                                />
                                <ScoreItem
                                    label="Tính hoàn thiện"
                                    score={analysis.breakdown.completenessScore}
                                    maxScore={10}
                                    color="bg-pink-500"
                                />
                            </div>
                        </div>

                        {/* CV Analysis Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Skills */}
                            {cvAnalysis.skills && cvAnalysis.skills.length > 0 && (
                                <div className="bg-white border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-3 flex items-center">
                                        💼 Kỹ năng ({cvAnalysis.skills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cvAnalysis.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {cvAnalysis.experience && (
                                <div className="bg-white border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-3 flex items-center">
                                        🎯 Kinh nghiệm
                                    </h3>
                                    <p className="text-gray-700">{cvAnalysis.experience}</p>
                                </div>
                            )}

                            {/* Education */}
                            {cvAnalysis.education && (
                                <div className="bg-white border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-3 flex items-center">
                                        🎓 Học vấn
                                    </h3>
                                    <p className="text-gray-700">{cvAnalysis.education}</p>
                                </div>
                            )}

                            {/* Strengths */}
                            {cvAnalysis.strengths && cvAnalysis.strengths.length > 0 && (
                                <div className="bg-white border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-3 flex items-center">
                                        ✨ Điểm mạnh ({cvAnalysis.strengths.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {cvAnalysis.strengths.map((strength, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span className="text-gray-700">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Weaknesses */}
                            {cvAnalysis.weaknesses && cvAnalysis.weaknesses.length > 0 && (
                                <div className="bg-white border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-3 flex items-center">
                                        ⚠️ Điểm cần cải thiện ({cvAnalysis.weaknesses.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {cvAnalysis.weaknesses.map((weakness, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-orange-500 mr-2">!</span>
                                                <span className="text-gray-700">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                    💡 Khuyến nghị cải thiện
                                </h3>
                                <div className="space-y-4">
                                    {analysis.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg ${
                                                rec.priority === 'high'
                                                    ? 'bg-red-50 border border-red-200'
                                                    : rec.priority === 'medium'
                                                    ? 'bg-orange-50 border border-orange-200'
                                                    : 'bg-blue-50 border border-blue-200'
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <span className="text-2xl mr-3">
                                                    {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟠' : '🔵'}
                                                </span>
                                                <div className="flex-1">
                                                    <h4 className="font-bold mb-1">{rec.area}</h4>
                                                    <p className="text-gray-700 mb-2">{rec.message}</p>
                                                    <p className="text-sm text-gray-600 italic">
                                                        💡 {rec.suggestion}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center pt-4">
                            <button
                                onClick={handleAnalyzeCV}
                                disabled={analyzing}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {analyzing ? '🤖 Đang phân tích lại...' : '🔄 Phân tích lại'}
                            </button>
                            <Link
                                to="/cv/guide"
                                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                            >
                                📚 Xem hướng dẫn cải thiện CV
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Component hiển thị từng mục điểm
const ScoreItem = ({ label, score, maxScore, color }) => {
    const percentage = (score / maxScore) * 100;
    
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="font-semibold">{label}</span>
                <span className="text-gray-600">
                    {score}/{maxScore}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`${color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};
