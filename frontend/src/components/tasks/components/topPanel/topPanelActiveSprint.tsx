import { Dropdown, Input, MenuProps } from "antd";
import { debounce } from "lodash";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";

import FilterIconSvg from "@/assets/svg/filterIconSvg";
import SearchIconSvg from "@/assets/svg/searchIconSvg";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import PrioritySelectorComponent from "./components/prioritySelector";
import StatusSelectorComponent from "./components/statusSelector";
import { SearchParamsModel } from "models/apiParams";

type Props = {
  tasks: TaskDto[];
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParamsActiveSprint: Function;
  searchParamsActiveSprint: SearchParamsModel;
};
const TopPanelActiveSprint = ({
  tasks,
  activeSprintTasks,
  activeTab,
  setActiveTab,
  setSearchParamsActiveSprint,
  searchParamsActiveSprint,
}: Props) => {
  const [searchText, setSearchText] = useState(
    searchParamsActiveSprint.searchText
  );
  const [status, setStatus] = useState<string[]>(
    searchParamsActiveSprint.status
  );
  const [priority, setPriority] = useState(searchParamsActiveSprint.priority);
  const [active, setActive] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const statuses = useAppSelector(
    (state: RootState) => state.projectList.statuses
  );

  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin", "ActiveSprint"];
  const activeButton = (tab: string, setActiveTab: Function) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #00A3DE",
        borderRadius: "8px",
      }}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#00A3DE",
          borderRadius: "4px",
          color: "white",
        }}
      >
        {tab === "Pin"
          ? totalPinned
          : tab === "ActiveSprint"
          ? activeSprintTasks?.length
          : tasks?.length}
      </div>
      <div className="text-[15px]">{tab}</div>
    </div>
  );

  const inactiveButton = (tab: string, setActiveTab: Function) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #ECECED",
        borderRadius: "8px",
      }}
      onClick={() => setActiveTab(tab)}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#E7E7E7",
          borderRadius: "4px",
          color: "black",
        }}
      >
        {tab === "Pin"
          ? totalPinned
          : tab === "ActiveSprint"
          ? activeSprintTasks?.length
          : tasks?.length}
      </div>
      <div className="text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
  // useEffect(()=>)
  useEffect(() => {
    if (
      JSON.stringify(searchParamsActiveSprint) !==
      JSON.stringify({
        searchText: searchText,
        priority: priority,
        status: status,
      })
    ) {
      setSearchParamsActiveSprint({
        searchText: searchText,
        priority: priority,
        status: status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  useEffect(() => {
    if (
      JSON.stringify(searchParamsActiveSprint) !=
      JSON.stringify({
        searchText: searchText,
        priority: priority,
        status: status,
      })
    ) {
      setSearchParamsActiveSprint({
        searchText: searchText,
        priority: priority,
        status: status,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, priority, status]);
  const filterOptions = [
    <PrioritySelectorComponent
      key={Math.random()}
      {...{ priority, setPriority }}
    />,
    <StatusSelectorComponent key={Math.random()} {...{ status, setStatus }} />,
    // {
    //   icon: <ClockIconSvg />,
    //   title: "Estimation",
    // },
    // {
    //   icon: <SortPriorityIconSvg />,
    //   title: "Progress",
    // },
  ];
  const items: MenuProps["items"] = filterOptions.map((option, index) => {
    return {
      label: option,
      key: index,
    };
  });
  const menuProps = {
    items,
    onClick: (item: any) => {},
  };
  return (
    <div className="my-5 flex w-full justify-between">
      <div className="flex gap-3">
        {tabs?.map((tab) => {
          return activeTab === tab
            ? activeButton(tab, setActiveTab)
            : inactiveButton(tab, setActiveTab);
        })}
      </div>
      <div className="flex items-center gap-12">
        {activeTab !== "ActiveSprint" && (
          <DateRangePicker {...{ setSelectedDate }} />
        )}
        <Input
          placeholder="Search"
          prefix={<SearchIconSvg />}
          onChange={(event) => {
            event.persist();
            debouncedHandleInputChange(event);
          }}
          allowClear
        />
        <div
          className="flex items-center gap-3"
          onMouseLeave={() => {
            setActive("");
          }}
        >
          {/* <div
            className={`flex cursor-pointer gap-2 text-[#00A3DE] ${
              active === "Sort" ? "" : "grayscale"
            }`}
            style={{
              color: active === "Sort" ? "#00A3DE" : "black",
              // backgroundColor: "#00A3DE",
            }}
            onClick={() => ("Sort" ? setActive("") : setActive("Sort"))}
          >
            <SortIconSvg />
            <span className="font-normal">Sort</span>
          </div> */}

          <div
            className={`relative flex cursor-pointer gap-2 text-[#00A3DE] ${
              active === "Filter" ? "" : "grayscale"
            }`}
            style={{
              color: active === "Filter" ? "#00A3DE" : "black",
              // backgroundColor: "#00A3DE",
            }}
          >
            <Dropdown
              menu={menuProps}
              placement="bottomRight"
              open={dropdownOpen}
              onOpenChange={(open) => {
                setDropdownOpen(open);
              }}
              trigger={["click"]}
              className="transition-all delay-1000 duration-1000"
              overlayClassName="duration-1000 delay-1000 transition-all w-[300px]"
            >
              <div
                className="flex"
                // onClick={() =>
                //   active === "Filter" ? setActive("") : setActive("Filter")
                // }
              >
                <FilterIconSvg />
                <span className="font-normal">Filter</span>
              </div>
            </Dropdown>

            <div
              className={`${active === "Filter" ? "duration-500" : "hidden h-0"}
              absolute  top-[25px] right-0 z-50 flex
              w-[320px] flex-col gap-2 p-6`}
              style={{
                background: "#FFFFFF",
                boxShadow:
                  "0px 2px 6px rgba(24, 24, 28, 0.08), 0px 41px 32px -23px rgba(24, 24, 28, 0.06)",
                borderRadius: "12px",
              }}
            >
              {filterOptions?.map((option) => option)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPanelActiveSprint;
