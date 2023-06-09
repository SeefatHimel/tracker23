import { Empty, Input, message, Spin, Table } from "antd";
import { userAPI } from "APIs";
import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  taskPriorityEnum,
} from "utils/constants";

import {
  formatDate,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { useAppDispatch } from "@/storage/redux";
import { setSprintListReducer } from "@/storage/redux/tasksSlice";

import { getFormattedTime } from "../../services/timeActions";
import { getDateRangeArray } from "../datePicker";
import TopPanelExportPage from "./components/topPanelExportPage";

import type { TableProps } from "antd/es/table";
const { Search } = Input;
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: any = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    render: (_: any, { title }: TaskDto) => (
      <div className="w-full text-left">
        <div className=" mx-auto max-w-[200px] font-semibold">
          {title ? title : "---"}
        </div>
      </div>
    ),
    // defaultSortOrder: "descend",
    sorter: (a: any, b: any) => {
      if (a.title === b.title) {
        return 0;
      }
      if (a.title > b.title) {
        return 1;
      }
      return -1;
    },
    align: "center",
    // render: (text) => <a>{text}</a>,
  },
  {
    title: "Project Name",
    dataIndex: "projectName",
    key: "projectName",
    render: (_: any, { projectName }: TaskDto) => (
      <div className="m-max mx-auto max-w-[200px] ">
        {projectName ? projectName : "---"}
      </div>
    ),
    align: "center",
    // render: (text) => <a>{text}</a>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (_: any, task: TaskDto) => (
      <div className="flex justify-center">
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

          <div>{task.status}</div>
        </div>
      </div>
    ),
  },
  {
    title: "Estimation",
    dataIndex: "estimation",
    key: "estimation",
    // defaultSortOrder: "descend",
    render: (_: any, { estimation }: TaskDto) => (
      <>{estimation ? estimation + " hrs" : "---"}</>
    ),
    sorter: (a: any, b: any) => a.estimation - b.estimation,
    align: "center",
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
        className="mx-auto w-min rounded px-2 text-black"
      >
        {taskPriorityEnum[priority]}
      </div>
    ),
    align: "center",
  },
  {
    title: "Started",
    dataIndex: "started",
    key: "started",
    align: "center",

    // defaultSortOrder: "descend",
    sorter: (a: any, b: any) => {
      if (a.startTime !== null && b.startTime !== null)
        return a.startTime - b.startTime;
      else if (b.startTime === null && a.startTime === null) return true;
      else if (a.startTime === null) return false;
      else return false;
    },
  },
  {
    title: "Ended",
    dataIndex: "ended",
    key: "ended",
    align: "center",
  },

  {
    title: "Total Spent",
    dataIndex: "total",
    key: "total",
    render: (_: any, task: any) => (task.total ? <>{task.total}</> : <>---</>),

    // defaultSortOrder: "descend",
    sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
    align: "center",
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

const ExportPageComponent = () => {
  const dispatch = useAppDispatch();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchText: null,
    selectedDate: getDateRangeArray("this-week"),
    priority: null,
    status: null,
  });
  const getTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getTasks(searchParams);
      const tmpTasks = res?.map((task: TaskDto) => {
        const started = task.sessions[0]
          ? getFormattedTime(formatDate(task.sessions[0].startTime))
          : "Not Started";
        const ended = task.sessions[task.sessions.length - 1]?.endTime
          ? getFormattedTime(
              formatDate(task.sessions[task.sessions.length - 1].endTime)
            )
          : task.sessions[0]
          ? "Running"
          : "Not Started";
        const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
        return {
          ...task,
          id: task.id,
          title: task?.title,
          description: task.description,
          estimation: task.estimation,
          startTime: formatDate(task.sessions[0]?.startTime),
          endTime: formatDate(task.sessions[task.sessions.length - 1]?.endTime),
          started: started,
          ended: ended,
          total: total,
          totalSpent: getTotalSpentTime(task.sessions),
          priority: task.priority,
        };
      });
      setTasks(tmpTasks || []);
    } catch (error) {
      console.log("🚀 ~ file: index.tsx:236 ~ getTasks ~ error:", error);
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };
  const getSprintList = async () => {
    const res = await userAPI.getJiraSprints();
    console.log("🚀 ~ file: index.tsx:365 ~ getSprintList ~ res:", res);
    if (res?.length > 0) dispatch(setSprintListReducer(res));
  };
  const onChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  useEffect(() => {
    getSprintList();
  }, []);

  return (
    <div>
      <TopPanelExportPage {...{ tasks, setSearchParams }} />
      <Spin spinning={loading}>
        {tasks.length ? (
          <div className="flex flex-col gap-4">
            <Table
              columns={columns}
              dataSource={tasks}
              onChange={onChange}
              rowKey={"id"}
              pagination={{ position: ["bottomCenter"] }}
            />
          </div>
        ) : (
          <Empty description="No tasks" />
        )}
      </Spin>
    </div>
  );
};
export default ExportPageComponent;
