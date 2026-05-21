import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiCareerCategoryDto,
  IResponseListApiCareerCategoryDto,
} from 'src/application/dtos/career-category/res.career-category.dto';
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
  ResponseApiCareerCategoryDto,
  ResponseListApiCareerCategoryDto,
} from '../dtos/res.career-category.dto';
import { GetCareerCategoryByIdQuery } from 'src/application/queries/career-categories/get-career-categorie-by-id.query';

@Controller({ path: 'career-categories', version: '1' })
@ApiTags('Career Categories')
export class CareerCategoryController extends BaseController {
  constructor(
    private readonly getCareerCategoriesQuery: GetCareerCategoriesQuery,
    private readonly getCareerCategoryByIdQuery: GetCareerCategoryByIdQuery,
    private readonly createCareerCategoryUseCase: CreateCareerCategoryUseCase,
    private readonly updateCareerCategoryUseCase: UpdateCareerCategoryUseCase,
    private readonly deleteCareerCategoryUseCase: DeleteCareerCategoryUseCase,
  ) {
    super(new Logger(CareerCategoryController.name));
  }

  @Get()
  @ApiOperation({ summary: 'Get all career categories' })
  @ApiResponse({
    status: 200,
    description: 'Get all career categories successfully',
    type: ResponseListApiCareerCategoryDto,
  })
  async getAllCareerCategories(
    @Query() query: RequestGetCareerCategoriesDto,
  ): Promise<IResponseListApiCareerCategoryDto> {
    return await this.getCareerCategoriesQuery.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a career category by id' })
  @ApiResponse({
    status: 200,
    description: 'Get a career category by id successfully',
    type: ResponseApiCareerCategoryDto,
  })
  async getCareerCategoryById(
    @Param('id') id: string,
  ): Promise<IResponseApiCareerCategoryDto> {
    return await this.getCareerCategoryByIdQuery.execute(id);
  }

  @Post()
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new career category' })
  @ApiResponse({
    status: 201,
    description: 'Career category created successfully',
    type: ResponseApiCareerCategoryDto,
  })
  async createCareerCategory(
    @Body() dto: RequestCreateCareerCategoryDto,
  ): Promise<IResponseApiCareerCategoryDto> {
    return await this.createCareerCategoryUseCase.execute(dto);
  }

  @Patch(':id')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Update a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category updated successfully',
    type: ResponseApiCareerCategoryDto,
  })
  async updateCareerCategory(
    @Param('id') id: string,
    @Body() dto: RequestUpdateCareerCategoryDto,
  ): Promise<IResponseApiCareerCategoryDto> {
    return await this.updateCareerCategoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category deleted successfully',
    type: ResponseApiNullDto,
  })
  async deleteCareerCategory(@Param('id') id: string): Promise<{ message: string }> {
    return await this.deleteCareerCategoryUseCase.execute(id);
  }
}
