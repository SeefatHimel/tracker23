import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, Session, SessionStatus, User } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManualTimeEntryReqBody, SessionDto, SessionReqBodyDto } from './dto';
import axios from 'axios';
import * as moment from 'moment';
import { APIException } from 'src/internal/exception/api.exception';
import { TasksService } from 'src/tasks/tasks.service';
@Injectable()
export class SessionsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private tasksService: TasksService,
  ) {}

  async getSessions(user: User, taskId: number) {
    await this.validateTaskAccess(user, taskId);

    return await this.prisma.session.findMany({
      where: { taskId },
    });
  }

  async createSession(user: User, dto: SessionDto) {
    await this.validateTaskAccess(user, dto.taskId);
    await this.prisma.task.update({
      where: { id: dto.taskId },
      data: { status: 'In Progress', statusCategoryName: 'IN_PROGRESS' },
    });

    // Checking for previous active session
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId: dto.taskId, endTime: null },
    });

    if (activeSession) {
      await this.stopSession(user, activeSession.taskId);
    }

    return await this.prisma.session.create({
      data: { ...dto },
    });
  }

  async stopSession(user: User, taskId: number) {
    const task = await this.validateTaskAccess(user, taskId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.tasksService.updateIssueStatus(user, taskId + '', task.status + '');
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId, endTime: null },
    });

    if (!activeSession) {
      throw new BadRequestException('No active session');
    }
    const timeSpent = Math.ceil(
      (new Date(Date.now()).getTime() - activeSession.startTime.getTime()) /
        1000,
    );
    if (timeSpent < 60) {
      await this.prisma.session.delete({
        where: { id: activeSession.id },
      });
      throw new BadRequestException({
        message: 'Session canceled due to insufficient time',
      });
    }
    const updated_session = await this.stopSessionUtil(activeSession.id);

    if (task.integratedTaskId) {
      const session = await this.logToIntegrations(
        user,
        task.integratedTaskId,
        updated_session,
      );
      if (!session) {
        throw new BadRequestException({
          message: 'Session canceled due to insufficient time',
        });
      }
      await this.updateTaskUpdatedAt(taskId);
    }
    return updated_session;
  }

  async validateTaskAccess(user: User, taskId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (task.userId !== user.id) {
      throw new UnauthorizedException('You do not have access to this task');
    }
    return task;
  }

  async stopSessionUtil(sessionId: number) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { endTime: new Date(), status: SessionStatus.STOPPED },
    });
  }

  async logToIntegrations(
    user: User,
    integratedTaskId: number,
    session: Session,
  ) {
    if (session.endTime == null) {
      return null;
    }
    const timeSpent = Math.ceil(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000,
    );
    if (timeSpent < 60) {
      return null;
    }
    const updated_integration = await this.updateIntegration(user);
    if (!updated_integration) {
      return null;
    }

    const jiraSession = await this.addWorkLog(
      session.startTime,
      integratedTaskId as unknown as string,
      this.timeConverter(timeSpent),
      updated_integration,
    );
    const localSession =
      jiraSession &&
      (await this.prisma.session.update({
        where: { id: session.id },
        data: {
          authorId: updated_integration?.jiraAccountId
            ? updated_integration?.jiraAccountId
            : null,
          integratedTaskId: jiraSession ? Number(jiraSession.issueId) : null,
          worklogId: jiraSession ? Number(jiraSession.id) : null,
        },
      }));
    if (!localSession) return null;
    return { success: true, msg: 'Successfully Updated to jira' };
  }

  async updateIntegration(user: User) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    if (!integration) {
      throw new APIException('You have no integration', HttpStatus.BAD_REQUEST);
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: integration?.refreshToken,
    };

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    const updated_integration = await this.prisma.integration.update({
      where: { id: integration?.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });
    return updated_integration;
  }

  timeConverter(timeSpent: number) {
    if (!timeSpent) {
      return 0 + 'm';
    }
    timeSpent = Math.ceil(timeSpent / 60);
    return timeSpent + 'm';
  }

  async addWorkLog(
    startTime: any,
    issueId: string,
    timeSpentReqBody: string,
    integration: any,
  ) {
    try {
      const url = `https://api.atlassian.com/ex/jira/${integration.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const data = JSON.stringify({
        started: this.getUtcTime(startTime),
        timeSpent: timeSpentReqBody,
      });
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
      const workLog = await (await axios(config)).data;
      return workLog;
    } catch (err) {
      return null;
    }
  }
  getUtcTime(date: any) {
    const targetTimezoneOffset = '';
    // Create a moment object with the original timestamp
    const originalMoment = moment(date);

    // Convert to the target timezone
    const targetMoment = originalMoment.utcOffset(targetTimezoneOffset);

    // Format the target moment object
    const formattedString = targetMoment.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const tmp =
      formattedString.substr(0, formattedString.length - 3) +
      formattedString[formattedString.length - 2] +
      formattedString[formattedString.length - 1];
    console.log(
      '🚀 ~ file: sessions.service.ts:211 ~ SessionsService ~ getUtcTime ~ tmp:',
      tmp,
    );
    return `${tmp}`;
  }

  async manualTimeEntry(user: User, dto: ManualTimeEntryReqBody) {
    try {
      const startTime = new Date(`${dto.startTime}`);
      const endTime = new Date(`${dto.endTime}`);
      const { integratedTaskId, id } = await this.validateTaskAccess(
        user,
        dto.taskId,
      );

      const timeSpent = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / 1000,
      );
      if (timeSpent < 60) {
        throw new APIException(
          'Insufficient TimeSpent',
          HttpStatus.BAD_REQUEST,
        );
      }
      let jiraSession: any;
      let updated_integration;
      if (integratedTaskId) {
        updated_integration = await this.updateIntegration(user);
        if (updated_integration)
          jiraSession = await this.addWorkLog(
            startTime,
            integratedTaskId as unknown as string,
            this.timeConverter(Number(timeSpent)),
            updated_integration,
          );
        jiraSession && this.updateTaskUpdatedAt(dto.taskId);
      }
      if (id) {
        return await this.prisma.session.create({
          data: {
            startTime: startTime,
            endTime: endTime,
            status: SessionStatus.STOPPED,
            taskId: id,
            authorId: updated_integration?.jiraAccountId
              ? updated_integration?.jiraAccountId
              : null,
            integratedTaskId: jiraSession ? Number(jiraSession.issueId) : null,
            worklogId: jiraSession ? Number(jiraSession.id) : null,
          },
        });
      } else {
        throw new APIException(
          'Something is wrong in manual time entry',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Something is wrong in manual time entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSession(
    user: User,
    sessionId: string,
    reqBody: SessionReqBodyDto,
  ) {
    try {
      const doesExistWorklog = await this.prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (!doesExistWorklog) {
        throw new APIException('No session found', HttpStatus.BAD_REQUEST);
      }

      let session: Session | false | null = null;
      const task = await this.prisma.task.findFirst({
        where: {
          id: doesExistWorklog.taskId,
          userId: user.id,
        },
      });
      if (task && task.source === IntegrationType.TRACKER23) {
        session = await this.updateSessionFromLocal(Number(sessionId), reqBody);
        return session;
      }

      const updated_integration = await this.updateIntegration(user);
      if (doesExistWorklog.authorId === updated_integration.jiraAccountId) {
        const startTime = new Date(`${reqBody.startTime}`);
        const endTime = new Date(`${reqBody.endTime}`);
        const timeSpentReqBody = Math.ceil(
          (endTime.getTime() - startTime.getTime()) / 1000,
        );
        if (timeSpentReqBody < 60) {
          throw new APIException(
            'Insufficient TimeSpent',
            HttpStatus.BAD_REQUEST,
          );
        }

        const timeSpent = this.timeConverter(Number(timeSpentReqBody));
        const data = JSON.stringify({
          started: this.getUtcTime(startTime),
          timeSpent: timeSpent,
        });
        const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${doesExistWorklog?.integratedTaskId}/worklog/${doesExistWorklog.worklogId}`;
        const config = {
          method: 'put',
          url,
          headers: {
            Authorization: `Bearer ${updated_integration?.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: data,
        };

        const response = (await axios(config)).data;
        session =
          response &&
          (await this.updateSessionFromLocal(Number(sessionId), reqBody));
        task && (await this.updateTaskUpdatedAt(task.id));
      }

      if (!session) {
        throw new APIException(
          'You are not allowed to update this session!',
          HttpStatus.BAD_REQUEST,
        );
      }
      return session;
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong to update this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSessionFromLocal(sessionId: number, reqBody: SessionReqBodyDto) {
    const updateFromLocal = await this.prisma.session.update({
      where: {
        id: Number(sessionId),
      },
      data: reqBody,
    });
    if (!updateFromLocal) {
      throw new APIException(
        'Can not update this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return updateFromLocal;
  }

  async deleteSession(user: User, sessionId: string) {
    try {
      const doesExistWorklog = await this.prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (!doesExistWorklog) {
        throw new APIException('No session found', HttpStatus.BAD_REQUEST);
      }

      let session: Session | false | null = null;
      const task = await this.prisma.task.findFirst({
        where: {
          id: doesExistWorklog.taskId,
          userId: user.id,
        },
      });
      if (task && task.source === IntegrationType.TRACKER23) {
        session = await this.deleteSessionFromLocal(Number(sessionId));
        return { message: 'Session Deleted Successfully!' };
      }

      const updated_integration = await this.updateIntegration(user);
      if (doesExistWorklog.authorId === updated_integration.jiraAccountId) {
        const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${doesExistWorklog?.integratedTaskId}/worklog/${doesExistWorklog.worklogId}`;
        const config = {
          method: 'delete',
          url,
          headers: {
            Authorization: `Bearer ${updated_integration?.accessToken}`,
            'Content-Type': 'application/json',
          },
        };

        const status = (await axios(config)).status;
        session =
          status === 204 &&
          (await this.deleteSessionFromLocal(Number(sessionId)));
        task && this.updateTaskUpdatedAt(task.id);
      }

      if (!session) {
        throw new APIException(
          'You are not allowed to delete this session!',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Session deleted successfully!' };
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong to delete this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteSessionFromLocal(sessionId: number) {
    const deleteFromLocal = await this.prisma.session.delete({
      where: {
        id: Number(sessionId),
      },
    });
    if (!deleteFromLocal) {
      throw new APIException(
        'Can not delete this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return deleteFromLocal;
  }

  async updateTaskUpdatedAt(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        sessions: true,
      },
    });

    const sessionDate: any = task?.sessions
      .map((el: any) => {
        if (el.endTime > new Date(Date.now())) return el.endTime;
      })
      .filter((val: any) => val)
      .sort((x: Date, y: Date) => {
        return new Date(y).getTime() - new Date(x).getTime();
      });

    let date = new Date(Date.now());
    if (sessionDate?.length > 0 && date < sessionDate[0]) date = sessionDate[0];
    await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        updatedAt: date,
      },
    });
  }
}
