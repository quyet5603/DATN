import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

export const MyJobs = () => {

    const tableHeaderCss = "px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
    
    const [applications, setApplications] = useState([]);
    const [loginData, setLoginData] = useState();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        let token = localStorage.getItem("user");
        if (token) {
            const user = JSON.parse(token);
            setLoginData(Array.isArray(user) ? user[0] : user);
        }
    }, [])

    useEffect(() => {
        const fetchApplications = async () => {
            if (!loginData?._id) {
                console.log('No loginData._id found');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log('Fetching applications for candidateID:', loginData._id);
                
                // Fetch applications của user - sửa endpoint đúng
                const response = await fetch(`http://localhost:8080/application/all-application/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allApplications = await response.json();
                console.log('All applications:', allApplications);
                
                // Filter applications của user này - so sánh cả string và ObjectId
                const userApplications = allApplications.filter(app => {
                    const candidateIdStr = app.candidateID?.toString();
                    const loginIdStr = loginData._id?.toString();
                    const match = candidateIdStr === loginIdStr;
                    if (!match) {
                        console.log('Mismatch:', { candidateId: candidateIdStr, loginId: loginIdStr });
                    }
                    return match;
                });
                console.log('Filtered applications:', userApplications);
                
                // Fetch job details cho mỗi application
                const applicationsWithJobs = await Promise.all(
                    userApplications.map(async (app) => {
                        try {
                            const jobResponse = await fetch(`http://localhost:8080/jobs/current-job/${app.jobID}`);
                            const job = await jobResponse.json();
                            return {
                                ...app,
                                job: job,
                                jobTitle: job?.jobTitle || 'N/A',
                                employmentType: job?.employmentType || 'N/A',
                                location: job?.location || 'N/A',
                                matchScore: app.matchScore || 0
                            };
                        } catch (error) {
                            console.error(`Error fetching job ${app.jobID}:`, error);
                            return {
                                ...app,
                                jobTitle: 'N/A',
                                employmentType: 'N/A',
                                location: 'N/A',
                                matchScore: app.matchScore || 0
                            };
                        }
                    })
                );
                
                // Sort theo match score (cao nhất trước)
                applicationsWithJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                
                setApplications(applicationsWithJobs);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (loginData?._id) {
            fetchApplications();
        }
    }, [loginData]);

    return (
        <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4'>

            <div className='py-1'>
                <div className='w-full '>

                    {/* MAIN TABLE */}
                    <section className="py-1 bg-blueGray-50">
                        <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4 mx-auto mt-24">
                            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
                                <div className="rounded-t mb-0 px-4 py-3 border-0 bg-secondary text-white ">
                                    <div className="flex flex-wrap items-center">
                                        <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-center">
                                            <h3 className="font-bold text-base text-blueGray-700">Đơn ứng tuyển của tôi</h3>
                                        </div>

                                    </div>
                                </div>

                                <div className="block w-full overflow-x-hidden">
                                    <table className="items-center bg-transparent w-full border-collapse ">
                                        <thead>
                                            <tr>
                                                <th className={tableHeaderCss}>Vị trí công việc</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Loại</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Địa điểm</th>
                                                <th className={tableHeaderCss}>Trạng thái</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : applications.length > 0 ? (
                                                applications.map((application, key) => <RenderTableRows key={key} application={application} />)
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                        Chưa có đơn ứng tuyển nào
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>

                    </section>
                </div>
            </div>
        </div>
    )
}

function RenderTableRows({application}){
    
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"

    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Đang xét duyệt',
            'shortlist': 'Đã duyệt',
            'rejected': 'Đã từ chối',
            'inactive': 'Đã hủy'
        };
        return statusMap[status] || 'Đang xét duyệt';
    };

    return (
        <tr>
            <th className={`${tableDataCss} text-left text-blueGray-700 px-3 md:px-6`}>
                <Link to={`/current-job/${application.jobID}`} className="hover:text-blue-600 hover:underline">
                    {application.jobTitle}
                </Link>
            </th>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                {application.employmentType}
            </td>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                {application.location}
            </td>
            <td className={`${tableDataCss} font-bold hidden md:table-cell`}>
                {getStatusText(application.applicationStatus)}
            </td>
        </tr>
    )
}