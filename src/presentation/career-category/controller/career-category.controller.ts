import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCareerCategoryUseCase } from 'src/application/use-cases/career-category/create-career-category.usecase';
import { DeleteCareerCategoryUseCase } from 'src/application/use-cases/career-category/delete-career-category.usecase';
import { GetAllCareerCategoriesUseCase } from 'src/application/use-cases/career-category/get-all-career-categories.usecase';
import { UpdateCareerCategoryUseCase } from 'src/application/use-cases/career-category/update-career-category.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import {
  RequestCreateCareerCategoryDto,
  RequestUpdateCareerCategoryDto,
} from '../dtos/req.career-category.dto';

@Controller({ path: 'career-categories', version: '1' })
@ApiTags('Career Categories')
export class CareerCategoryController extends BaseController {
  constructor(
    private readonly createCareerCategoryUseCase: CreateCareerCategoryUseCase,
    private readonly getAllCareerCategoriesUseCase: GetAllCareerCategoriesUseCase,
    private readonly updateCareerCategoryUseCase: UpdateCareerCategoryUseCase,
    private readonly deleteCareerCategoryUseCase: DeleteCareerCategoryUseCase,
  ) {
    super(new Logger(CareerCategoryController.name));
  }

  @Post()
  @AuthRequired()
  @Roles(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new career category' })
  @ApiResponse({
    status: 201,
    description: 'Career category created successfully',
  })
  async createCareerCategory(@Body() dto: RequestCreateCareerCategoryDto) {
    return this.createCareerCategoryUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all career categories' })
  @ApiResponse({
    status: 200,
    description: 'Get all career categories successfully',
  })
  async getAllCareerCategories() {
    return this.getAllCareerCategoriesUseCase.execute();
  }

  @Patch(':id')
  @AuthRequired()
  @Roles(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Update a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category updated successfully',
  })
  async updateCareerCategory(
    @Param('id') id: string,
    @Body() dto: RequestUpdateCareerCategoryDto,
  ) {
    return this.updateCareerCategoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @AuthRequired()
  @Roles(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category deleted successfully',
  })
  async deleteCareerCategory(@Param('id') id: string) {
    return this.deleteCareerCategoryUseCase.execute(id);
  }
}
