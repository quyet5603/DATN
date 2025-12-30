import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

export const ShortlistedCandidates = () => {

    const tableHeaderCss = "px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
    
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shortlistApplication, setShortlistApplication] = useState()
    const [shortlistCandidate, setShortlistCandidate] = useState()

    useEffect(() => {

        try {
            fetch(`http://localhost:8080/application/all-application/`)
            .then((res) => res.json())
            .then((data) => {
                const filterData = data.filter(item => item.applicationStatus === "shortlist"); 
                setShortlistApplication(filterData);
                console.log(filterData);
            })
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        function fetchData(){
            try {
                fetch(`http://localhost:8080/users/all-users/`)
                .then((res) => res.json())
                .then((data) => {
                    const filterData = data.filter(user => {
                        return shortlistApplication.some(application => application.candidateID === user._id)
                    }); 
                    setShortlistCandidate(filterData);
                    console.log(filterData);
                })
                fetch(`http://localhost:8080/jobs/all-jobs/`)
                .then((res) => res.json())
                .then((data) => {
                    const filterData = data.filter(job => {
                        return shortlistApplication.some(application => application.jobID === job._id)
                    }); 
                    setJobs(filterData);
                    console.log(filterData);
                })
            } catch (error) {
                console.log(error);
            }
        }
        if(shortlistApplication){
            fetchData();
        }
    }, [shortlistApplication]);

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
                                            <h3 className="font-bold text-base text-blueGray-700">Ứng viên đã được chọn</h3>
                                        </div>

                                    </div>
                                </div>

                                <div className="block w-full overflow-x-hidden">
                                    <table className="items-center bg-transparent w-full border-collapse ">
                                        <thead>
                                            <tr>
                                                <th className={tableHeaderCss}>Ứng viên</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Email</th>
                                                <th className={`${tableHeaderCss} hidden md:table-cell`}>Kết quả</th>
                                                <th className={tableHeaderCss}></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {shortlistCandidate && jobs && shortlistApplication && shortlistCandidate.length > 0 ? (
                                                shortlistCandidate.map((candidate, key) => {
                                                    // Tìm application của candidate này
                                                    const application = shortlistApplication.find(app => app.candidateID === candidate._id);
                                                    // Tìm job của application này
                                                    const job = application ? jobs.find(j => j._id === application.jobID) : null;
                                                    
                                                    return (
                                                        <RenderTableRows 
                                                            key={candidate._id || key} 
                                                            candidate={candidate} 
                                                            job={job}
                                                            application={application}
                                                        />
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                        Không tìm thấy ứng viên nào được chọn
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

function RenderTableRows({candidate, job, application}){
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
    
    // Kiểm tra dữ liệu hợp lệ
    if (!candidate || !candidate._id) {
        return null;
    }
    
    // Nếu không có job, vẫn hiển thị candidate nhưng không có link chi tiết
    const jobId = job?._id || application?.jobID || '';
    
    return (
        <tr>
            <th className= {`${tableDataCss} text-left text-blueGray-700 px-3 md:px-6`}>
                {candidate.userName || 'N/A'}
            </th>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                {candidate.userEmail || 'N/A'}
            </td>
            <td className={`${tableDataCss} hidden md:table-cell`}>
                Đã được chọn
            </td>
            <td className={`flex justify-between ${tableDataCss}`}>
                {jobId ? (
                    <Link to={`/shortlist/details/${candidate._id}/${jobId}`}>
                        <button className='block bg-secondary text-white mx-auto text-md py-2 px-2 md:px-6 rounded-md hover:opacity-90 transition-opacity'>Chi tiết</button>
                    </Link>
                ) : (
                    <span className='text-gray-400 text-sm'>Không có thông tin job</span>
                )}
            </td>
        </tr>
    )
}