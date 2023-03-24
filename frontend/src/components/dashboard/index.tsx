import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import PieChart from "@/components/dashboard/charts/pieChart";
import XYChart from "@/components/dashboard/charts/xyChart";
import MyTasks from "@/components/dashboard/myTasks";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { getLocalStorage } from "@/storage/storage";
import {
  Badge,
  Button,
  message,
  Progress,
  Table,
  TablePaginationConfig,
  Typography,
} from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { userAPI } from "APIs";
import { TableParams, TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  progressColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from "utils/constants";
import GlobalMOdal from "../modals/globalModal";
import StopWatchTabular from "../stopWatch/tabular/reactStopWatchTabular";
import Stopwatch from "../stopWatch/tabular/timerComponent";
import ProgressComponent from "../tasks/components/progessComponent";
import StaticProgressComponent from "../tasks/components/progessComponentStatic";
import TimeDisplayComponent from "../tasks/components/timeDisplayComponent";
import SessionStartWarning from "../tasks/components/warning";
import DonutChart from "./charts/donutChart";
import Line from "./charts/MultiValueAxesChart";
import MultiValueAxesChart from "./charts/MultiValueAxesChart";
import { useRouter } from "next/router";
const { Text } = Typography;

const DashBoard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const data = [
    { category: "Frontend", value: 20 },
    { category: "Misc", value: 25 },
    { category: "Testing", value: 15 },
    { category: "UI", value: 10 },
    { category: "Backend", value: 30 },
  ];
  const dataDonut = [
    { category: "Tracker23", value: 20 },
    { category: "TimeTackle", value: 15 },
    { category: "BS Commerce", value: 5 },
  ];
  const data2 = [
    { day: 1, hours: 3 },
    { day: 2, hours: 8 },
    { day: 3, hours: 1 },
    { day: 4, hours: 7 },
    { day: 5, hours: 4 },
    { day: 6, hours: 0 },
    { day: 7, hours: 5 },
    { day: 8, hours: 7 },
    { day: 9, hours: 2 },
    { day: 10, hours: 8 },
    { day: 11, hours: 2 },
    { day: 12, hours: 5 },
    { day: 13, hours: 1 },
    { day: 14, hours: 8 },
    { day: 15, hours: 0 },
    { day: 16, hours: 3 },
    { day: 17, hours: 5 },
    { day: 18, hours: 8 },
    { day: 19, hours: 1 },
    { day: 20, hours: 6 },
    { day: 21, hours: 2 },
    { day: 22, hours: 3 },
    { day: 23, hours: 4 },
    { day: 24, hours: 8 },
    { day: 25, hours: 3 },
    { day: 26, hours: 0 },
    { day: 27, hours: 4 },
    { day: 28, hours: 7 },
    { day: 29, hours: 1 },
    { day: 30, hours: 5 },
  ];
  const weekData = [
    { day: "18 March", hours: 8 },
    { day: "19 March", hours: 1 },
    { day: "20 March", hours: 6 },
    { day: "21 March", hours: 2 },
    { day: "22 March", hours: 3 },
    { day: "23 March", hours: 4 },
    { day: "24 March", hours: 8 },
  ];
  const data3 = [
    {
      category: "Category 1",
      value1: 10,
      value2: 20,
    },
    {
      category: "Category 2",
      value1: 20,
      value2: 25,
    },
    {
      category: "Category 3",
      value1: 15,
      value2: 30,
    },
    {
      category: "Category 4",
      value1: 5,
      value2: 15,
    },
    {
      category: "Category 5",
      value1: 25,
      value2: 10,
    },
  ];
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<TaskDto> | SorterResult<TaskDto>[]
  ) => {
    setTableParamsPinned({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setData([]);
    // }
  };
  const [reload, setReload] = useState(false);

  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [morePin, setMorePin] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };
  const [tableParamsPinned, setTableParamsPinned] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
      position: ["bottomRight", "bottomLeft"],

      // total: 100,
    },
  });
  const getRowClassName = (task: TaskDto, index: any) => {
    if (!task.sessions) task.sessions = [];
    return runningTask?.id === task.id ? "bg-[#F3FCFF]" : "";
  };
  const getTasks = async () => {
    setLoading(true);
    let pinnedTasks = getLocalStorage("pinnedTasks");
    if (!pinnedTasks) pinnedTasks = [];
    try {
      const res = await userAPI.getTasks();
      console.log("🚀 ~ file: index.tsx:112 ~ getTasks ~ res:", res);
      const tmpTasks = res.map((task: TaskDto) => {
        task.sessions = task.sessions.sort(function compareFn(a: any, b: any) {
          return a.id - b.id;
        });

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

        if (ended === "Running") setRunningTask(task);
        const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
        return {
          ...task,
          pinned: pinnedTasks?.includes(task?.id),
          id: task?.id,
          title: task?.title,
          // description: task?.description,
          // estimation: task?.estimation,
          // startTime: formatDate(task?.sessions[0]?.startTime),
          // endTime: formatDate(
          //   task?.sessions[task?.sessions?.length - 1]?.endTime
          // ),
          started: started,
          ended: ended,
          total: total,
          // percentage: task?.estimation
          //   ? Math.round(
          //       getTotalSpentTime(task?.sessions) / (task?.estimation * 36000)
          //     )
          //   : -1,
          // totalSpent: getTotalSpentTime(task?.sessions),
          // priority: task?.priority,
        };
      });
      console.log("****************************************");
      const tmpPinnedTaskList = tmpTasks?.filter(
        (task: TaskDto) => task?.pinned
      );
      if (tmpPinnedTaskList?.length > 5) setMorePin(true);
      const pinnedTaskList = tmpPinnedTaskList?.filter(
        (task: TaskDto, index: any) => index < 5
      );
      console.log(
        "🚀 ~ file: index.tsx:154 ~ getTasks ~ tmpTasks:",
        tmpTasks,
        pinnedTaskList
      );
      setTasks(pinnedTaskList || []);
      // console.log(">>>>>", pinnedTaskList, pinnedTaskList.length);

      setTableParamsPinned({
        ...tableParamsPinned,
        pagination: {
          ...tableParamsPinned.pagination,
          total: pinnedTaskList.length,
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

  const handleWarningClick = async (proceed: boolean) => {
    setWarningModalOpen(false);
    if (proceed) {
      try {
        await stopSession(runningTask);
        setRunningTask(warningData);
        await handleSessionStart(warningData);
        setWarningData(null);
      } catch (error) {
        message.error("Something went wrong.");
      }
    }
    setWarningModalOpen(false);
  };
  const handleSessionStart = async (task: TaskDto) => {
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
  const startSession = async (task: TaskDto) => {
    // console.log(">>>>>>", runningTask);

    if (runningTask && runningTask?.id != task.id) {
      setWarningData(task);
      setWarningModalOpen(true);
    } else {
      await handleSessionStart(task);
    }
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
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className=" flex items-center gap-2">
            {runningTask?.id != task.id ? (
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
            <div className="flex flex-col gap-2">
              <Text className="w-[200px] " ellipsis={{ tooltip: task?.title }}>
                {/* <div>{task?.title}</div> */}
                {task?.title}
              </Text>
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
            </div>
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
    // {
    //   title: "Date",
    //   dataIndex: "started",
    //   key: "started",
    // },
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
          <Stopwatch milliseconds={getTotalSpentTime(task.sessions)} />
          // <StopWatchTabular
          //   task={task}
          //   // sessions={task.sessions}
          //   // runningTask={runningTask}
          //   addSession={() => {}}
          //   addEndTime={() => {}}
          // />
        ),
    },
    {
      title: "Estimation",
      dataIndex: "estimation",
      key: "estimation",
      render: (_: any, task: TaskDto) =>
        task.estimation ? (
          <div className="text-center">{task.estimation}hrs</div>
        ) : (
          <div className="text-center">---</div>
        ),
    },
    // {
    //   title: "",
    //   dataIndex: "",
    //   key: "",

    //   render: (_: any, task: TaskDto) => (
    //     <div className="flex justify-end gap-2">
    //       <Button
    //         className="h-10 text-sm font-semibold"
    //         onClick={() => {
    //           // setSelectedTask(task);
    //           // setTaskViewModalOpen(true);
    //         }}
    //       >
    //         View
    //       </Button>
    //       {/* <MoreFunctionComponent {...{ task, deleteTask, handlePin }} /> */}
    //     </div>
    //   ),
    // },
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
  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold ">Project wise Track hour</div>
          <div className=" rounded-lg border-2 p-1 px-2 text-sm">This Week</div>
        </div>
        <DonutChart data={dataDonut} />
      </div>
      <div className="relative flex flex-col gap-2">
        <div className="text-lg font-semibold ">Pinned tasks</div>
        <Table
          columns={columns}
          dataSource={getPinnedTasks()}
          // onChange={onChange}
          size="small"
          rowKey={(record) => record.id}
          pagination={null}
          // pagination={tableParamsPinned.pagination}
          rowClassName={getRowClassName}
          onChange={handleTableChange}
          scroll={{
            scrollToFirstRowOnChange: true,
            x: true,
          }}
        />
        {morePin && (
          <div
            className="absolute bottom-0 right-1/2 left-1/2 w-max cursor-pointer hover:text-blue-500"
            onClick={() => {
              router.push("/taskList?tab=pin");
            }}
          >
            {" "}
            Click to View More
          </div>
        )}
      </div>
      <div className="relative flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold ">Tracker By Day</div>
          <div className=" rounded-lg border-2 p-1 px-2 text-sm">This Week</div>
        </div>
        <div className="text-lg font-semibold "></div>
        <XYChart data={weekData} />
      </div>
      {/* <div>
        <PieChart data={data} title="Task wise Track hour" />
      </div> */}
      {/* <MultiValueAxesChart data={data3} /> */}
      <div className="relative flex w-[700px] flex-col gap-2">
        {/* <div className=" right-32 top-[40px] rounded-lg border-2 p-2">
          This Week
        </div> */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold ">Actual VS Estimate </div>
          <div className=" rounded-lg border-2 p-1 px-2 text-sm">This Week</div>
        </div>
        <div className="w-full">
          <Line />
        </div>
      </div>
      {/* <div>
        <MyTasks />
      </div> */}
      <GlobalMOdal
        isModalOpen={warningModalOpen}
        setIsModalOpen={setWarningModalOpen}
      >
        <SessionStartWarning
          runningTask={runningTask}
          warningData={warningData}
          handleWarningClick={handleWarningClick}
        />
      </GlobalMOdal>
    </div>
  );
};

export default DashBoard;
