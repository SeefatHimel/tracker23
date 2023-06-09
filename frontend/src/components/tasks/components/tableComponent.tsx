import {
  Button,
  Table,
  TablePaginationConfig,
  Tooltip,
  Typography,
  message,
} from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams, TaskDto } from "models/tasks";
import { useState } from "react";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from "utils/constants";

import JiraIconSvg from "@/assets/svg/JiraIconSvg";
import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import { getTotalSpentTime } from "@/services/timeActions";
import { getLocalStorage, setLocalStorage } from "@/storage/storage";

import MoreFunctionComponent from "./moreFunction";
import ProgressComponent from "./progressComponent";
import StaticProgressComponent from "./progressComponentStatic";
import TimeDisplayComponent from "./timeDisplayComponent";
import StatusDropdownComponent from "./statusDropdown";
import { userAPI } from "APIs";
import EstimationComponent from "./estimationComponent";

const { Text } = Typography;
const TableComponent = ({
  tasks,
  runningTask,
  setSelectedTask,
  setTaskViewModalOpen,
  deleteTask,
  startSession,
  stopSession,
  setManualTimeEntryModalOpen,
  sessionActionLoading,
  setLoading,
  handleStatusChange,
  handleEstimationChange,
  handlePinTask,
}: any) => {
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className="flex items-center gap-2" aria-disabled="true">
            {
              // task.status !== "DONE" &&
              <div className="cursor-pointer">
                {runningTask?.id != task.id ? (
                  <Tooltip title="Click To Start Task">
                    <div
                      onClick={() => {
                        !sessionActionLoading && startSession(task);
                      }}
                    >
                      <PlayIconSvg />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip title="Click To Stop Task">
                    <div
                      onClick={() => {
                        !sessionActionLoading && stopSession(task);
                      }}
                    >
                      <PauseIconSvg />
                    </div>
                  </Tooltip>
                )}
              </div>
            }
            {/* {task.status === "DONE" && <div className="w-[34px]"></div>} */}
            <div className="flex flex-col gap-2">
              <Text
                className="w-[180px] cursor-pointer"
                ellipsis={{ tooltip: task?.title }}
                onClick={() => {
                  setSelectedTask(task);
                  setTaskViewModalOpen(true);
                }}
              >
                {/* <div>{task?.title}</div> */}
                {task?.title}
              </Text>
              <div className="flex cursor-pointer gap-2">
                {task.projectName && (
                  <div
                    className="w-max bg-[#4D4E55] px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: "#ECECED",
                      borderRadius: "4px",
                    }}
                  >
                    {task.projectName}
                  </div>
                )}
                {task.projectName && <JiraIconSvg />}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => {
        if (a.title === b.title) {
          return 0;
        }

        if (a.title > b.title) {
          return 1;
        }

        return -1;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // align: "center",
      render: (_: any, task: TaskDto) => (
        <StatusDropdownComponent
          selectedStatus={{
            name: task.status,
            statusCategoryName: task.statusCategoryName,
          }}
          task={task}
          setLoading={setLoading}
          handleStatusChange={handleStatusChange}
        >
          <div
            style={{
              backgroundColor: statusBGColorEnum[task.statusCategoryName],
              border: `1px solid ${
                statusBorderColorEnum[task.statusCategoryName]
              }`,
              borderRadius: "36px",
            }}
            className="relative flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: statusBorderColorEnum[task.statusCategoryName],
              }}
            />
            <div className="max-w-[90px]">
              <Text className="" ellipsis={{ tooltip: task?.status }}>
                {task.status}
              </Text>
            </div>
          </div>
        </StatusDropdownComponent>
      ),
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      // align: "center",
      sorter: (a: any, b: any) => {
        const aCreated = new Date(a.created);
        const bCreated = new Date(b.created);
        if (aCreated === bCreated) {
          return 0;
        }

        if (aCreated > bCreated) {
          return 1;
        }

        return -1;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (_: any, { priority }: TaskDto) => (
        <div
          style={{
            backgroundColor: PriorityBGColorEnum[priority],
            border: `1px solid ${PriorityBorderColorEnum[priority]}`,
          }}
          className="w-min rounded px-2 text-black"
        >
          {taskPriorityEnum[priority]}
        </div>
      ),
    },

    {
      title: "Progress",
      dataIndex: "percentage",
      key: "percentage",

      // align: "center",
      render: (_: any, task: TaskDto) =>
        runningTask?.id != task.id ? (
          <StaticProgressComponent task={task} />
        ) : (
          <ProgressComponent task={task} />
        ),
    },
    {
      title: "Total Spent",
      dataIndex: "total",
      key: "total",
      // align: "center",
      render: (_: any, task: TaskDto) =>
        runningTask?.id !== task.id ? (
          <TimeDisplayComponent totalTime={getTotalSpentTime(task.sessions)} />
        ) : (
          <Stopwatch
            milliseconds={getTotalSpentTime(task.sessions)}
            task={task}
          />
          // <StopWatchTabular
          //   task={task}
          //   // sessions={task.sessions}
          //   // runningTask={runningTask}
          //   addSession={() => {}}
          //   addEndTime={() => {}}
          // />
        ),
      sorter: (a: any, b: any) =>
        getTotalSpentTime(a.sessions) - getTotalSpentTime(b.sessions),
    },
    {
      title: "Estimation",
      dataIndex: "estimation",
      key: "estimation",
      render: (_: any, task: TaskDto) => (
        <EstimationComponent {...{ task, handleEstimationChange }} />
      ),
      sorter: (a: any, b: any) => a.estimation - b.estimation,
    },
    {
      title: "",
      dataIndex: "",
      key: "",
      width: 70,
      render: (_: any, task: TaskDto) => (
        <div className="flex justify-end gap-2">
          {/* <Button
            className="h-10 text-sm font-semibold"
            onClick={() => {
              setSelectedTask(task);
              setTaskViewModalOpen(true);
            }}
          >
            View
          </Button> */}
          <MoreFunctionComponent
            {...{ task, deleteTask, handlePin, handleAddManualWorkLog }}
          />
        </div>
      ),
    },
    // {
    //   title: "Tags",
    //   key: "tags",
    //   dataIndex: "tags",
    //   render: (_, { tags }) => (
    //     <>
    //       {tags.map((tag) => {
    //         let color = tag.length > 5 ? "blue" : "green";
    //         if (tag === "loser") {
    //           color = "volcano";
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, task) => (
    //     <Space size="middle">
    //       <a>Invite {task.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
      position: ["bottomRight", "bottomLeft"],

      // total: 100,
    },
  });
  const handleAddManualWorkLog = (task: TaskDto) => {
    setManualTimeEntryModalOpen(true);
    setSelectedTask(task);
  };
  const handlePin = async (task: TaskDto) => {
    const res = handlePinTask(task);
    if (res)
      task.pinned
        ? (tableParams.pagination.total = tableParams.pagination.total - 1)
        : (tableParams.pagination.total = tableParams.pagination.total + 1);
  };

  const getRowClassName = (task: TaskDto, index: any) => {
    if (!task.sessions) task.sessions = [];
    return runningTask?.id === task.id ? "bg-[#F3FCFF]" : "";
  };
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<TaskDto> | SorterResult<TaskDto>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setData([]);
    // }
  };
  return (
    <Table
      columns={columns}
      dataSource={tasks}
      // onChange={onChange}
      rowKey={(task) => task.id}
      pagination={tableParams.pagination}
      rowClassName={getRowClassName}
      onChange={handleTableChange}
    />
  );
};

export default TableComponent;
