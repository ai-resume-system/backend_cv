import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
} from '../dtos/res.skill.dto';

@Controller({ path: 'skills', version: '1' })
@ApiTags('Skills - Public')
export class SkillController extends BaseController {
  constructor(
    private readonly getSkillsQuery: GetSkillsQuery,
    private readonly getSkillBySlugQuery: GetSkillBySlugQuery,
  ) {
    super(new Logger(SkillController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all skills. Access: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiSkillDto })
  async getSkills(
    @Query() dto: RequestGetSkillsDto,
  ): Promise<IResponseListApiSkillDto> {
    return await this.getSkillsQuery.execute(dto);
  }

  @Get(':slug')
  @ApiOperation({
    summary:
      'Get skill detail by slug. Access: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiSkillDto })
  async getSkillBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiSkillDto> {
    return await this.getSkillBySlugQuery.execute(slug);
  }
}
