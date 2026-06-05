import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiPublicCareerCategoryDto,
  IResponseListApiPublicCareerCategoryDto,
} from 'src/application/dtos/career-category/res.career-category-public.dto';
import { GetCareerCategoriesQuery } from 'src/application/queries/career-categories/get-career-categories.query';
import { GetCareerCategoryBySlugQuery } from 'src/application/queries/career-categories/get-career-category-by-slug.query';
import { GetTopCareerCategoriesQuery } from 'src/application/queries/career-categories/get-top-career-categories.query';
import { BaseController } from 'src/common/base/base.controller';
import {
  RequestGetCareerCategoriesDto,
  RequestGetTopCareerCategoriesDto,
} from '../dtos/req.career-category.dto';
import {
  ResponseApiPublicCareerCategoryDto,
  ResponseListApiPublicCareerCategoryDto,
} from '../dtos/res.career-category-public.dto';

@Controller({ path: 'career-categories', version: '1' })
@ApiTags('Career Categories - Public')
export class CareerCategoryPublicController extends BaseController {
  constructor(
    private readonly getCareerCategoriesQuery: GetCareerCategoriesQuery,
    private readonly getTopCareerCategoriesQuery: GetTopCareerCategoriesQuery,
    private readonly getCareerCategoryBySlugQuery: GetCareerCategoryBySlugQuery,
  ) {
    super(new Logger(CareerCategoryPublicController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Lay danh sach nganh nghe dang hoat dong. Truy cap: Public, Job Seeker, Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get active career categories successfully',
    type: ResponseListApiPublicCareerCategoryDto,
  })
  async getAllCareerCategories(
    @Query() query: RequestGetCareerCategoriesDto,
  ): Promise<IResponseListApiPublicCareerCategoryDto> {
    return await this.getCareerCategoriesQuery.execute(query);
  }

  @Get('top')
  @ApiOperation({
    summary: 'Lay top nganh nghe cong khai. Truy cap: Public, Job Seeker, Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get top career categories successfully',
    type: ResponseListApiPublicCareerCategoryDto,
  })
  async getTopCareerCategories(
    @Query() query: RequestGetTopCareerCategoriesDto,
  ): Promise<IResponseListApiPublicCareerCategoryDto> {
    return await this.getTopCareerCategoriesQuery.execute(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet nganh nghe dang hoat dong theo slug. Truy cap: Public, Job Seeker, Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get an active career category by slug successfully',
    type: ResponseApiPublicCareerCategoryDto,
  })
  async getCareerCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiPublicCareerCategoryDto> {
    return await this.getCareerCategoryBySlugQuery.execute(slug);
  }
}
