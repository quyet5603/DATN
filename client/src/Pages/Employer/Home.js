import React from 'react'
import { Link } from 'react-router-dom'
import 'boxicons';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Về chúng tôi */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            JobFinder - Nền tảng tuyển dụng chuyên nghiệp
          </h1>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Nền tảng tuyển dụng hiện đại, nơi kết nối nhà tuyển dụng với ứng viên chất lượng và hỗ trợ quản lý hồ sơ CV chuyên nghiệp
          </p>
        </div>
      </div>

      {/* Sứ mệnh của chúng tôi */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          Tầm nhìn & Cam kết
        </h2>
        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
          <p className="text-base md:text-lg">
            Chúng tôi hiểu rằng việc tìm kiếm nhân tài phù hợp là thách thức lớn đối với mọi doanh nghiệp, đồng thời ứng viên cũng cần một nền tảng tin cậy để thể hiện năng lực và tìm kiếm cơ hội phát triển. Sứ mệnh của chúng tôi là tạo ra một cầu nối hiệu quả, giúp quá trình tuyển dụng trở nên đơn giản, minh bạch và thành công hơn.
          </p>
          <p className="text-base md:text-lg">
            Bằng việc tích hợp công nghệ hiện đại với giao diện trực quan, chúng tôi không chỉ giúp nhà tuyển dụng tìm được ứng viên phù hợp một cách nhanh chóng, mà còn hỗ trợ ứng viên xây dựng hồ sơ chuyên nghiệp và tiếp cận những cơ hội việc làm chất lượng.
          </p>
        </div>
      </div>

      {/* Tại sao chọn chúng tôi? */}
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <box-icon name='briefcase' size='32px' color='#14B8A6'></box-icon>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Hàng nghìn việc làm</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kết nối với các công ty hàng đầu Việt Nam, cập nhật việc làm mới mỗi ngày
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <box-icon name='group' size='32px' color='#14B8A6'></box-icon>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Cộng đồng lớn mạnh</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hơn 100,000+ ứng viên và 5,000+ nhà tuyển dụng tin tưởng sử dụng
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <box-icon name='file-blank' size='32px' color='#14B8A6'></box-icon>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">CV chuyên nghiệp</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tạo CV ấn tượng với các mẫu thiết kế hiện đại và dễ sử dụng
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <box-icon name='trending-up' size='32px' color='#14B8A6'></box-icon>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Phát triển sự nghiệp</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Công cụ và tài nguyên giúp bạn phát triển kỹ năng và thăng tiến
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Giá trị cốt lõi */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
          Giá trị cốt lõi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <box-icon name='heart' size='32px' color='#14B8A6'></box-icon>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tận tâm</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Đặt lợi ích của ứng viên và nhà tuyển dụng lên hàng đầu
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <box-icon name='target-lock' size='32px' color='#14B8A6'></box-icon>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Chính xác</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cung cấp thông tin việc làm và ứng viên chính xác, đáng tin cậy
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <box-icon name='link' size='32px' color='#14B8A6'></box-icon>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Kết nối</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tạo cầu nối hiệu quả giữa ứng viên và doanh nghiệp
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100K+</div>
              <div className="text-white text-lg">Ứng viên</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5K+</div>
              <div className="text-white text-lg">Công ty</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-white text-lg">Việc làm</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-white text-lg">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Sẵn sàng bắt đầu hành trình mới?
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn ứng viên và nhà tuyển dụng đã tìm thấy thành công trên nền tảng của chúng tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/all-posted-jobs"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Tìm việc làm
            </Link>
            <Link
              to="/signup"
              className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
