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
import { GetCareerCategoriesQuery } from 'src/application/queries/career-categories/get-career-categories.query';
import { CreateCareerCategoryUseCase } from 'src/application/use-cases/career-category/create-career-category.usecase';
import { DeleteCareerCategoryUseCase } from 'src/application/use-cases/career-category/delete-career-category.usecase';
import { UpdateCareerCategoryUseCase } from 'src/application/use-cases/career-category/update-career-category.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
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
  ): Promise<ResponseListApiCareerCategoryDto> {
    const result = await this.getCareerCategoriesQuery.execute(query);
    return result;
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
  ): Promise<ResponseApiCareerCategoryDto> {
    const result = await this.getCareerCategoryByIdQuery.execute(id);
    return result;
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
  ): Promise<ResponseApiCareerCategoryDto> {
    const result = await this.createCareerCategoryUseCase.execute(dto);
    return result;
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
  ): Promise<ResponseApiCareerCategoryDto> {
    const result = await this.updateCareerCategoryUseCase.execute(id, dto);
    return result;
  }

  @Delete(':id')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category deleted successfully',
  })
  async deleteCareerCategory(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const result = await this.deleteCareerCategoryUseCase.execute(id);
    return result;
  }
}
