import { DataSource } from 'typeorm';
import { CareerCategoryOrmEntity } from '../entities/career-category.orm-entity';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

export async function seedCareerCategories(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(CareerCategoryOrmEntity);

  const categories = [
    {
      name: 'Công nghệ thông tin',
      description:
        'Phát triển phần mềm, quản trị hệ thống, an ninh mạng và các giải pháp công nghệ.',
    },
    {
      name: 'Marketing',
      description:
        'Nghiên cứu thị trường, xây dựng thương hiệu, quảng cáo và phát triển kinh doanh.',
    },
    {
      name: 'Tài chính - Ngân hàng',
      description:
        'Quản lý tài chính, đầu tư, tín dụng và các dịch vụ ngân hàng.',
    },
    {
      name: 'Nhân sự',
      description:
        'Tuyển dụng, đào tạo, quản lý nhân sự và phát triển văn hóa doanh nghiệp.',
    },
    {
      name: 'Thiết kế',
      description:
        'Thiết kế đồ họa, UI/UX, sáng tạo nội dung và phát triển sản phẩm trực quan.',
    },
    {
      name: 'Kỹ thuật',
      description:
        'Thiết kế, vận hành và bảo trì các hệ thống kỹ thuật và công nghiệp.',
    },
    {
      name: 'Giáo dục',
      description: 'Giảng dạy, đào tạo và phát triển chương trình học tập.',
    },
    {
      name: 'Y tế',
      description: 'Chăm sóc sức khỏe, khám chữa bệnh và các dịch vụ y khoa.',
    },
    {
      name: 'Kế toán',
      description: 'Quản lý sổ sách, báo cáo tài chính và kiểm toán.',
    },
    {
      name: 'Luật',
      description:
        'Tư vấn pháp lý, giải quyết tranh chấp và hỗ trợ tuân thủ pháp luật.',
    },
  ];

  for (const cat of categories) {
    const existing = await categoryRepo.findOne({
      where: { name: cat.name },
    });
    if (!existing) {
      await categoryRepo.save({
        ...cat,
        is_active: true,
      });
    }
  }

  console.log('Career categories seeded');
}
