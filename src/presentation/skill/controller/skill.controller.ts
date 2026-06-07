import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiSkillDto,
  IResponseListApiSkillDto,
} from 'src/application/dtos/skill/res.skill.dto';
import { GetSkillBySlugQuery } from 'src/application/queries/skill/get-skill-by-slug.query';
import { GetSkillsQuery } from 'src/application/queries/skill/get-skills.query';
import { BaseController } from 'src/common/base/base.controller';
import { RequestGetSkillsDto } from '../dtos/req.skill.dto';
import {
  ResponseApiSkillDto,
  ResponseListApiSkillDto,
  ResponseSkillTreeDto,
} from '../dtos/res.skill.dto';

@Controller({ path: 'skills', version: '1' })
@ApiTags('Skills - Public')
@ApiExtraModels(ResponseSkillTreeDto)
export class SkillController extends BaseController {
  constructor(
    private readonly getSkillsQuery: GetSkillsQuery,
    private readonly getSkillBySlugQuery: GetSkillBySlugQuery,
  ) {
    super(new Logger(SkillController.name));
  }

  @Get()
  @ApiOperation({
    summary:
      'Lay danh sach tat ca ky nang theo nhom skill cha va skill con. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiSkillDto })
  async getSkills(
    @Query() dto: RequestGetSkillsDto,
  ): Promise<IResponseListApiSkillDto> {
    return await this.getSkillsQuery.execute(dto);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet ky nang theo slug. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async getSkillBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiSkillDto> {
    return await this.getSkillBySlugQuery.execute(slug);
  }
}
