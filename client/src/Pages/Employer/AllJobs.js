import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'
import { LoginContext } from '../../components/ContextProvider/Context';

export const AllJobs = () => {

    const tableHeaderCss = "px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
    
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { loginData } = useContext(LoginContext);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:8080/jobs/all-jobs");
                const data = await response.json();
                
                console.log('All jobs from API:', data);
                console.log('LoginData:', loginData);
                
                // Lấy userId từ loginData hoặc localStorage
                let userId = loginData?._id;
                if (!userId) {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            userId = user._id;
                        } catch (e) {
                            console.error('Error parsing user:', e);
                        }
                    }
                }
                
                // Nếu có userId, filter jobs của employer đó
                // Nếu không có userId hoặc không filter được, hiển thị tất cả jobs
                let jobsToShow = [];
                
                if (userId) {
                    const userEmployerId = userId.toString();
                    // Filter jobs của employer đang đăng nhập
                    const employerJobs = data.filter(job => {
                        const jobEmployerId = job.employerId?.toString();
                        return jobEmployerId === userEmployerId;
                    });
                    
                    // Nếu không có jobs sau filter, có thể là jobs cũ không có employerId
                    // Trong trường hợp này, hiển thị tất cả jobs
                    jobsToShow = employerJobs.length > 0 ? employerJobs : data;
                } else {
                    // Không có userId, hiển thị tất cả jobs
                    jobsToShow = data;
                }
                
                // Fetch số lượng ứng viên cho mỗi job
                try {
                    const appResponse = await fetch("http://localhost:8080/application/all-application");
                    const allApplications = await appResponse.json();
                    
                    console.log('All applications:', allApplications);
                    
                    const jobsWithCounts = jobsToShow.map(job => {
                        const jobId = job._id.toString();
                        // So sánh linh hoạt: cả string và ObjectId
                        const applications = allApplications.filter(app => {
                            const appJobID = app.jobID?.toString();
                            return appJobID === jobId || appJobID === job._id.toString() || app.jobID === job._id;
                        });
                        
                        console.log(`Job ${job.jobTitle} (${jobId}): ${applications.length} applications`);
                        
                        return {
                            ...job,
                            applicationsCount: applications.length
                        };
                    });
                    
                    setJobs(jobsWithCounts);
                } catch (appError) {
                    console.error('Error fetching applications:', appError);
                    setJobs(jobsToShow);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [loginData])
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
                                            <h3 className="font-bold text-base text-blueGray-700">Tất cả việc làm đã đăng</h3>
                                        </div>

                                    </div>
                                </div>

                                <div className="block w-full overflow-x-hidden">
                                    <table className="items-center bg-transparent w-full border-collapse ">
                                        <thead>
                                            <tr>
                                                <th className={tableHeaderCss}>Tiêu đề công việc</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Lương</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Địa điểm</th>
                                                <th className={tableHeaderCss}>Ứng viên</th>
                                                <th className={tableHeaderCss}>Thao tác</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : jobs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        Chưa có việc làm nào được đăng. <Link to="/post-job" className="text-blue-600 hover:underline">Đăng việc ngay</Link>
                                                    </td>
                                                </tr>
                                            ) : (
                                                jobs.map((job, key) => <RenderTableRows key={key} job={job} />)
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
function HandlerDeleteJob(id){
    try {
        fetch(`http://localhost:8080/jobs/delete-job/${id}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            // Handle the response data here
            toast.success("Xóa thành công")
        });
    } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Không thể xóa")
    }
}


function RenderTableRows({job}){
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
    return (

        <tr>
            <th className= {`${tableDataCss} text-left text-blueGray-700 px-3 md:px-6`}>
                <Link to={`/current-job/${job._id}`} className="hover:text-blue-600 hover:underline">
                    {job.jobTitle}
                </Link>
            </th>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                {job.salary ? `${job.salary} triệu/tháng` : 'Thỏa thuận'}
            </td>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                {job.location}
            </td>
            <td className={tableDataCss}>
                <Link 
                    to={`/matched-candidates/${job._id}`}
                    className="text-blue-600 hover:text-blue-900 hover:underline font-medium"
                >
                    Xem ứng viên ({job.applicationsCount || 0})
                </Link>
            </td>
            <td className={`flex gap-2 ${tableDataCss}`}>
                <Link to={`/update-job/${job._id}`}>
                    <button className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa">
                        <box-icon name='edit'/>
                    </button>
                </Link>
                <button 
                    className="text-red-600 hover:text-red-900" 
                    onClick={() => HandlerDeleteJob(job._id)}
                    title="Xóa"
                >
                    <box-icon name='trash' />
                </button>
            </td>
        </tr>
    )
}