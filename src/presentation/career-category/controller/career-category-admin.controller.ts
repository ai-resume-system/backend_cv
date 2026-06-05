import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiAdminCareerCategoryDto,
  IResponseListApiAdminCareerCategoryDto,
} from 'src/application/dtos/career-category/res.career-category-admin.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { GetCareerCategoriesQuery } from 'src/application/queries/career-categories/get-career-categories.query';
import { CreateCareerCategoryUseCase } from 'src/application/use-cases/career-category/create-career-category.usecase';
import { DeleteCareerCategoryUseCase } from 'src/application/use-cases/career-category/delete-career-category.usecase';
import { UpdateCareerCategoryUseCase } from 'src/application/use-cases/career-category/update-career-category.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestCreateCareerCategoryDto,
  RequestGetCareerCategoriesDto,
  RequestUpdateCareerCategoryDto,
} from '../dtos/req.career-category.dto';
import {
  ResponseApiAdminCareerCategoryDto,
  ResponseListApiAdminCareerCategoryDto,
} from '../dtos/res.career-category-admin.dto';
import { GetCareerCategoryBySlugQuery } from 'src/application/queries/career-categories/get-career-category-by-slug.query';

@Controller({ path: 'admin/career-categories', version: '1' })
@ApiTags('Career Categories - Admin')
@AuthRequired(EUserRole.ADMIN)
export class CareerCategoryAdminController extends BaseController {
  constructor(
    private readonly getCareerCategoriesQuery: GetCareerCategoriesQuery,
    private readonly getCareerCategoryBySlugQuery: GetCareerCategoryBySlugQuery,
    private readonly createCareerCategoryUseCase: CreateCareerCategoryUseCase,
    private readonly updateCareerCategoryUseCase: UpdateCareerCategoryUseCase,
    private readonly deleteCareerCategoryUseCase: DeleteCareerCategoryUseCase,
  ) {
    super(new Logger(CareerCategoryAdminController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Lay tat ca nganh nghe, gom ca inactive va soft-deleted. Truy cap: Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get all career categories for admin successfully',
    type: ResponseListApiAdminCareerCategoryDto,
  })
  async getAllCareerCategories(
    @Query() query: RequestGetCareerCategoriesDto,
  ): Promise<IResponseListApiAdminCareerCategoryDto> {
    return await this.getCareerCategoriesQuery.executeAdmin(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet nganh nghe theo slug, gom ca soft-deleted. Truy cap: Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get a career category for admin successfully',
    type: ResponseApiAdminCareerCategoryDto,
  })
  async getCareerCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiAdminCareerCategoryDto> {
    return await this.getCareerCategoryBySlugQuery.executeAdmin(slug);
  }

  @Post()
  @ApiOperation({
    summary: 'Tao moi mot nganh nghe. Truy cap: Admin.',
  })
  @ApiResponse({
    status: 201,
    description: 'Career category created successfully',
    type: ResponseApiAdminCareerCategoryDto,
  })
  async createCareerCategory(
    @Body() dto: RequestCreateCareerCategoryDto,
  ): Promise<IResponseApiAdminCareerCategoryDto> {
    return await this.createCareerCategoryUseCase.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cap nhat mot nganh nghe. Truy cap: Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Career category updated successfully',
    type: ResponseApiAdminCareerCategoryDto,
  })
  async updateCareerCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestUpdateCareerCategoryDto,
  ): Promise<IResponseApiAdminCareerCategoryDto> {
    return await this.updateCareerCategoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoa mot nganh nghe. Truy cap: Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Career category deleted successfully',
    type: ResponseApiNullDto,
  })
  async deleteCareerCategory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.deleteCareerCategoryUseCase.execute(id);
  }
}
