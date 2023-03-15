import {
  Button,
  Empty,
  Spin,
  message,
  Input,
  Table,
  Space,
  Progress,
  Tag,
  TablePaginationConfig,
} from "antd";
import { createContext, useEffect, useState } from "react";

import GlobalModal from "../modals/globalModal";
import SessionStartWarning from "./components/warning";
import SideCard from "./components/sideCard";
import { MoreOutlined, SyncOutlined } from "@ant-design/icons";
import { TableParams, TaskDto } from "models/tasks";
import TaskInput from "./components/taskInput";
import VerticalCard from "./components/verticalCard";
import { userAPI } from "APIs";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  progressColorEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from "utils/constants";
import { PlayIcon } from "@/icons/playIcon";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import StopWatchTabular from "../stopWatch/tabular/reactStopWatchTabular";
import { FilterValue, SorterResult } from "antd/es/table/interface";
const { Search } = Input;
export const TaskContext = createContext<any>({
  taskList: [],
  runningTask: null,
  handleWarning: null,
  selectedTask: null,
  setRunningTask: null,
});

const TasksPage = () => {
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [searchedTasks, setSearchedTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);

  const createTask = async (data: any) => {
    setLoading(true);
    try {
      const res = await userAPI.createTask(data);
      message.success("Task created successfully");
      setTasks((tasks) => [res, ...tasks]);
      setSearchedTasks((tasks) => [res, ...tasks]);
      if (tasks) {
        tasks.map((task) => {
          if (
            task.sessions &&
            task.sessions[task.sessions?.length - 1]?.status === "STARTED"
          ) {
            setRunningTask(task);
          }
        });
      }
      setViewModalOpen(false);
    } catch (error) {
      message.error("Error creating task");
      setViewModalOpen(false);
    } finally {
      setLoading(false);
    }
  };
  const handleWarning = async (tmpTask: any, startFunction: Function) => {
    const tmp = [];
    tmp.push(tmpTask);
    tmp.push(startFunction);
    setWarningData(tmp);
    setWarningModalOpen(true);
  };
  const handleWarningClick = async (proceed: boolean) => {
    if (proceed) {
      await warningData[1]();
      setWarningData([]);
    }
    setWarningModalOpen(false);
  };

  const deleteTask = async (taskId: any) => {
    setLoading(true);
    try {
      const res = await userAPI.deleteTask(taskId);
      if (res) {
        setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
        setSearchedTasks((tasks) => tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      message.error("Error deleting task");
    } finally {
      setLoading(false);
    }
  };

  const getTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getTasks();
      const tmpTasks = res.map((task: TaskDto) => {
        const started =
          task.sessions && task.sessions[0]
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started";
        const ended =
          task.sessions && task.sessions[task.sessions?.length - 1]?.endTime
            ? getFormattedTime(
                formatDate(task.sessions[task.sessions?.length - 1]?.endTime)
              )
            : task.sessions[0]
            ? "Running"
            : "Not Started";
        const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
        return {
          ...task,
          id: task.id,
          title: task.title,
          description: task.description,
          estimation: task.estimation,
          startTime: formatDate(task.sessions[0]?.startTime),
          endTime: formatDate(
            task.sessions[task.sessions?.length - 1]?.endTime
          ),
          started: started,
          ended: ended,
          total: total,
          percentage: task.estimation
            ? Math.round(
                getTotalSpentTime(task.sessions) / (task.estimation * 36000)
              )
            : -1,
          totalSpent: getTotalSpentTime(task.sessions),
          priority: task.priority,
        };
      });
      setTasks(tmpTasks || []);
      console.log(tmpTasks, tmpTasks.length);

      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: tmpTasks.length,
          // 200 is mock data, you should read it from server
          // total: data.totalCount,
        },
      });
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };
  const syncTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.syncTasks();
      setTasks([...res] || []);
      setSearchedTasks([...res] || []);

      message.success("Sync Successful");
    } catch (error) {
      message.error("Error syncing tasks");
    } finally {
      setLoading(false);
    }
    setSyncing(false);
  };

  const startSession = async (task: TaskDto) => {
    const session = await userAPI.createSession(task.id);
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions?.push(session);
      task.status = "IN_PROGRESS";
      setRunningTask({ ...task });
      session && message.success("Session Started");
      setReload(!reload);
    } else message.error("Session Start Failed");
  };
  const stopSession = async (task: TaskDto) => {
    const session = await userAPI.stopSession(task.id);
    if (session) {
      task.sessions = task.sessions?.map((_session: any) => {
        if (_session.id === session.id) return session;
        else return _session;
      });
      const st: any = formatDate(session.endTime);
      const en: any = formatDate(session.startTime);
      console.log("🚀 🚀🚀🚀🚀🚀🚀🚀🚀", session, st - en);

      (task.percentage = task.estimation
        ? Math.round(
            getTotalSpentTime(task.sessions) / (task.estimation * 36000)
          )
        : -1),
        setRunningTask(null);
      session && message.success("Session Ended");
      setReload(!reload);
    } else message.error("Session Ending Failed");
  };
  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    if (searchText?.length > 0) {
      setSearchedTasks(
        tasks.filter((task) => {
          if (
            task.title.includes(searchText) ||
            task.description.includes(searchText)
          )
            return task;
        })
      );
    } else {
      setSearchedTasks(tasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    if (tasks) {
      tasks.map((task) => {
        if (task.sessions[task.sessions?.length - 1]?.status === "STARTED") {
          setRunningTask(task);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log("runningTask", runningTask);
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className="flex items-center gap-2">
            {task.sessions &&
            (task.sessions[task.sessions?.length - 1]?.endTime ||
              task.sessions?.length === 0) ? (
              <div
                onClick={() => {
                  startSession(task);
                }}
              >
                <PlayIconSvg />
              </div>
            ) : (
              <div
                onClick={() => {
                  stopSession(task);
                }}
              >
                <PauseIconSvg />
              </div>
            )}
            <div>{task.title}</div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // align: "center",
      render: (_: any, { status }: TaskDto) => (
        <div
          style={{
            backgroundColor: statusBGColorEnum[status],
            border: `1px solid ${statusBorderColorEnum[status]}`,
            borderRadius: "36px",
          }}
          className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: statusBorderColorEnum[status],
            }}
          />

          <div>{taskStatusEnum[status]}</div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "started",
      key: "started",
      // align: "center",
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
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   align: "center",
    // },
    // {
    //   title: "Ended",
    //   dataIndex: "ended",
    //   key: "ended",
    //   align: "center",
    // },

    {
      title: "Progress",
      dataIndex: "percentage",
      key: "percentage",

      // align: "center",
      render: (_: any, record: TaskDto) => (
        <div
          className="flex w-max gap-3"
          // style={{
          //   color:
          //     record.percentage >= 0 && record.percentage < 100
          //       ? progressColorEnum[record.status]
          //       : "red",
          // }}
        >
          <div style={{ width: 80 }}>
            {/* <Progress percent={30} size="small" />
          <Progress percent={50} size="small" status="active" />
           */}
            {record.percentage >= 0 && record.percentage < 100 ? (
              <Progress
                percent={record.percentage}
                size="small"
                strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            ) : record.percentage === 100 ? (
              <Progress
                percent={record.percentage}
                size="small"
                status="success"
                strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            ) : (
              <Progress
                percent={record.percentage}
                size="small"
                status="exception"
                // strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            )}
          </div>
          {record.percentage >= 0 ? <>{record.percentage}%</> : <>0%</>}
        </div>
      ),
    },
    {
      title: "Total Spent",
      dataIndex: "total",
      key: "total",
      // align: "center",
      render: (_: any, task: any) => (
        <StopWatchTabular
          task={task}
          disable={task.id !== selectedTask?.id}
          addSession={() => {}}
          addEndTime={() => {}}
        />
      ),
    },
    {
      title: "Estimation",
      dataIndex: "estimation",
      key: "estimation",
      render: (_: any, record: any) =>
        record.estimation ? (
          <div className="text-center">{record.estimation}hrs</div>
        ) : (
          <div className="text-center">---</div>
        ),
    },
    {
      title: "",
      dataIndex: "estimation",
      key: "estimation",

      render: () => (
        <div className="flex justify-end gap-2">
          <Button className="h-10 text-sm font-semibold">View</Button>
          <Button className="flex h-10 w-10 items-center p-2">
            <MoreOutlined className="w-6" style={{ fontSize: "24px" }} />
          </Button>
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
    //         let color = tag.length > 5 ? "geekblue" : "green";
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
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];
  const getRowClassName = (task: TaskDto, index: any) => {
    if (!task.sessions) task.sessions = [];
    return task.sessions[task.sessions?.length - 1]?.endTime ||
      task.sessions?.length === 0
      ? ""
      : "bg-[#F3FCFF]";
  };
  useEffect(() => {}, [reload]);
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
  const [data, setData] = useState<TaskDto[]>(tasks);
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
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  return (
    <TaskContext.Provider
      value={{
        tasklist: tasks,
        runningTask: runningTask,
        handleWarning,
        setRunningTask,
      }}
    >
      <div
        className="mr-8 overflow-y-auto"
        style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex gap-1">
            <Button onClick={() => setViewModalOpen(true)}>Add Task</Button>
            <Button
              className={`flex items-center justify-center ${
                syncing ? "border-green-500 text-green-500" : ""
              }`}
              onClick={async () => {
                setSyncing(true);
                await syncTasks();
              }}
            >
              <SyncOutlined spin={syncing} />
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          {tasks.length ? (
            <div className="text-xs font-medium">
              <Table
                columns={columns}
                dataSource={tasks}
                // onChange={onChange}
                rowKey={(record) => record.id}
                pagination={tableParams.pagination}
                rowClassName={getRowClassName}
                onChange={handleTableChange}
              />
            </div>
          ) : loading ? (
            <Empty description="Getting tasks" />
          ) : (
            <Empty description="No tasks" />
          )}
        </Spin>

        <GlobalModal
          isModalOpen={viewModalOpen}
          setIsModalOpen={setViewModalOpen}
        >
          <TaskInput taskList={tasks} createTask={createTask} />
        </GlobalModal>
        <GlobalModal
          isModalOpen={warningModalOpen}
          setIsModalOpen={setWarningModalOpen}
        >
          <SessionStartWarning
            runningTask={runningTask}
            warningData={warningData}
            handleWarningClick={handleWarningClick}
          />
        </GlobalModal>
      </div>
    </TaskContext.Provider>
  );
};

export default TasksPage;
