export const publicRoutes = [
  "/login",
  "/registration",
  "/socialLogin/redirect",
];
export const ignoreRoutes = ["/_next", "/assets", "/integrations"];
export const menuOptions = [
  { link: "/taskList", title: "Tasks Page" },
  // { link: "/dashboard", title: "Dashboard Page" },
  // { link: "/integrations", title: "Integrations Page" },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];

export enum progressColorEnum {
  IN_PROGRESS = "#85C6DB",
  TO_DO = "#0099ff",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export const taskStatusEnum = {
  IN_PROGRESS: "In progress",
  TO_DO: "To do",
  DONE: "Done",
};

export enum statusBorderColorEnum {
  IN_PROGRESS = "#56A2E9",
  TO_DO = "#ADACB0",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export enum statusBGColorEnum {
  IN_PROGRESS = "#E4F2FF",
  TO_DO = "#F9F9F9",
  DONE = "#FAFFEA",
  BG = "#ECECED",
}
export const taskPriorityEnum = {
  HIGH: "High",
  LOW: "Low",
  MEDIUM: "Medium",
  NORMAL: "Medium",
};
export enum PriorityBGColorEnum {
  HIGH = "#FFF0ED",
  LOW = "#FFF9E2",
  MEDIUM = "#FFF4E8",
  NORMAL = "#FFF4E8",
}
export enum PriorityBorderColorEnum {
  HIGH = "#FE8A6F",
  LOW = "#F7DC7E",
  MEDIUM = "#FEBC6F",
  NORMAL = "#FEBC6F",
}

export const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const supportedIntegrations = ["JIRA"];
export const allIntegrations = ["JIRA", "TRELLO"];

export enum IntegrationTitlesEnum {
  JIRA = "Jira Software",
  TRELLO = "Trello",
}

export enum IntegrationDescriptionsEnum {
  JIRA = "Connect JIRA tickets to your Project",
  TRELLO = "Connect Trello to your Project",
}

export const whiteListEmails = [
  "seefathimel1@gmail.com",
  "test@gmail.com",
  "himel.bs23@gmail.com",
  "dipubala.bs23@gmail.com",
  "dipubala466@gmail.com",
  "sudipta@timetackle.com",
  "dipankar.bala@brainstation-23.com",
  "rizwanur.rahman17@gmail.com",
  "abdullahxaied@gmail.com",
  "belal.cseai@gmail.com",
  "dinar@timetackle.com",
  "shakil@timetackle.com",
  "shatabdibiswasswarna@gmail.com",
  "ismail.hosen@brainstation-23.com",
  "belal.cseai@gmail.com",
  "belal.hossain@brainstation-23.com",
  "rezve.hasan@brainstation-23.com",
  "anjarul.islam@brainstation-23.com",
  "ismail.hosen@brainstation-23.com",
  "rakib@brainstation-23.com",
  "shaishab.roy@brainstation-23.com",
  "zeeshan.ahmed@brainstation-23.com",
  "diptonil.singho@brainstation-23.com",
];
