import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { IResponseApiSkillDto } from 'src/application/dtos/skill/res.skill.dto';
import { CreateSkillUseCase } from 'src/application/use-cases/skill/create-skill.usecase';
import { DeleteSkillUseCase } from 'src/application/use-cases/skill/delete-skill.usecase';
import { UpdateSkillUseCase } from 'src/application/use-cases/skill/update-skill.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import {
  RequestCreateSkillDto,
  RequestUpdateSkillDto,
} from '../dtos/req.skill.dto';
import { ResponseApiSkillDto } from '../dtos/res.skill.dto';

@Controller({ path: 'admin/skills', version: '1' })
@ApiTags('Skills - Admin')
export class SkillAdminController extends BaseController {
  constructor(
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
  ) {
    super(new Logger(SkillAdminController.name));
  }
  @Post()
  @AuthRequired(EUserRole.ADMIN)
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
  @AuthRequired(EUserRole.ADMIN)
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
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Xoa mot ky nang. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiNullDto })
  async deleteSkill(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.deleteSkillUseCase.execute(id);
  }
}
