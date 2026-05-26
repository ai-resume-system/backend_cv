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
  IResponseApiSkillDto,
  IResponseListApiSkillDto,
} from 'src/application/dtos/skill/res.skill.dto';
import { GetSkillByIdQuery } from 'src/application/queries/skill/get-skill-by-id.query';
import { GetSkillsQuery } from 'src/application/queries/skill/get-skills.query';
import { CreateSkillUseCase } from 'src/application/use-cases/skill/create-skill.usecase';
import { DeleteSkillUseCase } from 'src/application/use-cases/skill/delete-skill.usecase';
import { UpdateSkillUseCase } from 'src/application/use-cases/skill/update-skill.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { ResponseApiBooleanDto } from 'src/common/dto/response.dto';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestCreateSkillDto,
  RequestGetSkillsDto,
  RequestUpdateSkillDto,
} from '../dtos/req.skill.dto';
import {
  ResponseApiSkillDto,
  ResponseListApiSkillDto,
} from '../dtos/res.skill.dto';

@Controller({ path: 'skills', version: '1' })
@ApiTags('Skills')
export class SkillController extends BaseController {
  constructor(
    private readonly getSkillsQuery: GetSkillsQuery,
    private readonly getSkillByIdQuery: GetSkillByIdQuery,
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
  ) {
    super(new Logger(SkillController.name));
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, type: ResponseListApiSkillDto })
  async getSkills(
    @Query() dto: RequestGetSkillsDto,
  ): Promise<IResponseListApiSkillDto> {
    return await this.getSkillsQuery.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill detail by id' })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async getSkillById(@Param('id') id: string): Promise<IResponseApiSkillDto> {
    return await this.getSkillByIdQuery.execute(id);
  }

  @Post()
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Create a skill' })
  @ApiResponse({ status: 201, type: ResponseApiSkillDto })
  async createSkill(
    @Body() dto: RequestCreateSkillDto,
  ): Promise<IResponseApiSkillDto> {
    return await this.createSkillUseCase.execute(dto);
  }

  @Patch(':id')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Update a skill' })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async updateSkill(
    @Param('id') id: string,
    @Body() dto: RequestUpdateSkillDto,
  ): Promise<IResponseApiSkillDto> {
    return await this.updateSkillUseCase.execute(id, dto);
  }

  @Delete(':id')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 200, type: ResponseApiBooleanDto })
  async deleteSkill(
    @Param('id') id: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.deleteSkillUseCase.execute(id);
  }
}
