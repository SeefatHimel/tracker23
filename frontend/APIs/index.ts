import { config } from "config";
import { apiFunction } from "utils/types";

import {
  addManualWorkLogRest,
  authJiraRest,
  createSessionRest,
  createTaskRest,
  deleteIntegrationRest,
  deleteTaskRest,
  exportTasksRest,
  getIntegrationsRest,
  getJiraLinkRest,
  getProjectWiseHourRest,
  getSpentTimePerDayRest,
  getTasksRest,
  googleLoginRest,
  loginRest,
  logoutRest,
  registerRest,
  sendJiraCodeRest,
  stopSessionRest,
  syncStatusRest,
  syncTasksRest,
} from "./restApi";

const graphqlApi: apiFunction = {
  login: loginRest,
  googleLogin: googleLoginRest,
  registerUser: registerRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  syncTasks: syncTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  sendJiraCode: sendJiraCodeRest,
  exportTasks: exportTasksRest,
  getIntegrations: getIntegrationsRest,
  deleteIntegration: deleteIntegrationRest,
  getProjectWiseHour: getProjectWiseHourRest,
  getSpentTimePerDay: getSpentTimePerDayRest,
  addManualWorkLog: addManualWorkLogRest,
};

const restApi: apiFunction = {
  login: loginRest,
  googleLogin: googleLoginRest,
  registerUser: registerRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  exportTasks: exportTasksRest,
  syncTasks: syncTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  sendJiraCode: sendJiraCodeRest,
  getIntegrations: getIntegrationsRest,
  deleteIntegration: deleteIntegrationRest,
  getProjectWiseHour: getProjectWiseHourRest,
  getSpentTimePerDay: getSpentTimePerDayRest,
  addManualWorkLog: addManualWorkLogRest,
};

export const userAPI: apiFunction =
  config?.apiService === "GRAPHQL" ? graphqlApi : restApi;
