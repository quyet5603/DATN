import React from 'react'
import { Link } from 'react-router-dom'

export const Hero = () => {
  const handleScrollToJobs = () => {
    // Scroll xuống phần việc làm
    const jobsSection = document.getElementById('featured-jobs');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Nếu không tìm thấy, scroll xuống một chút
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className='max-w-screen-2xl container mx-auto px-4 md:py-12 py-8'>
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='text-center max-w-3xl'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight'>Tìm việc làm ngay hôm nay!</h1>
            <p className='text-lg md:text-xl text-gray-600 mb-8 leading-relaxed'>Khám phá hàng nghìn cơ hội việc làm phù hợp với bạn</p>
            <button 
              onClick={handleScrollToJobs}
              className='bg-secondary text-white py-3 px-10 md:px-12 rounded-md text-lg font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform'
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}
