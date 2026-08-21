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
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  IResponseApiSkillDto,
  IResponseListApiSkillDto,
} from 'src/application/dtos/skill/res.skill.dto';
import { GetSkillBySlugQuery } from 'src/application/queries/skill/get-skill-by-slug.query';
import { GetSkillsQuery } from 'src/application/queries/skill/get-skills.query';
import { CreateSkillUseCase } from 'src/application/use-cases/skill/create-skill.usecase';
import { DeleteSkillUseCase } from 'src/application/use-cases/skill/delete-skill.usecase';
import { RestoreSkillUseCase } from 'src/application/use-cases/skill/restore-skill.usecase';
import { UpdateSkillUseCase } from 'src/application/use-cases/skill/update-skill.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import {
  RequestCreateSkillDto,
  RequestGetSkillsDto,
  RequestUpdateSkillDto,
} from '../dtos/req.skill.dto';
import {
  ResponseApiSkillDto,
  ResponseListApiSkillDto,
  ResponseSkillTreeDto,
} from '../dtos/res.skill.dto';

@Controller({ path: 'admin/skills', version: '1' })
@ApiTags('Skills - Admin')
@AuthRequired(EUserRole.ADMIN)
@ApiExtraModels(ResponseSkillTreeDto)
export class SkillAdminController extends BaseController {
  constructor(
    private readonly getSkillsQuery: GetSkillsQuery,
    private readonly getSkillBySlugQuery: GetSkillBySlugQuery,
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
    private readonly restoreSkillUseCase: RestoreSkillUseCase,
  ) {
    super(new Logger(SkillAdminController.name));
  }

  @Get()
  @ApiOperation({
    summary:
      'Lay danh sach ky nang theo nhom skill cha va skill con, gom ca soft-deleted. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiSkillDto })
  async getAllSkills(
    @Query() dto: RequestGetSkillsDto,
  ): Promise<IResponseListApiSkillDto> {
    return await this.getSkillsQuery.executeAdmin(dto);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet ky nang theo slug, gom ca soft-deleted. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async getSkillBySlug(@Param('slug') slug: string): Promise<IResponseApiSkillDto> {
    return await this.getSkillBySlugQuery.executeAdmin(slug);
  }

  @Post()
  @ApiOperation({
    summary: 'Tao moi mot ky nang. Truy cap: Admin.',
  })
  @ApiResponse({ status: 201, type: ResponseApiSkillDto })
  async createSkill(
    @Body() dto: RequestCreateSkillDto,
  ): Promise<IResponseApiSkillDto> {
    return await this.createSkillUseCase.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cap nhat mot ky nang. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async updateSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestUpdateSkillDto,
  ): Promise<IResponseApiSkillDto> {
    return await this.updateSkillUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoa mot ky nang. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiNullDto })
  async deleteSkill(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.deleteSkillUseCase.execute(id);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Khoi phuc mot ky nang da xoa mem. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiNullDto })
  async restoreSkill(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.restoreSkillUseCase.execute(id);
  }
}
