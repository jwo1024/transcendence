import React, { useEffect, useContext, useState } from "react";
import { Frame } from "@react95/core";
import { TaskListContext, ITask } from "@/context/PageContext";
import MenuList from "@/components/common/taskbar/MenuList";
import TaskButton from "@/components/common/taskbar/TaskButton";
import { UserInfo } from "@/types/UserInfo";

// TaskBar
const TaskBar = ({ currentPage }: { currentPage: string }) => {
  const { taskList } = useContext(TaskListContext);
  const [taskLists, setTaskLists] = useState<ITask[]>(taskList); // reducer ?
  const [activeTaskButton, setActiveTaskButton] = useState<number>(-1);
  const [startButtonClicked, setStartButtonClicked] = useState<boolean>(false);
  const [nickName, setNickName] = useState<string>("Loading...");

  useEffect(() => {
    setNickName(() => {
      const user = sessionStorage.getItem("user");
      if (user) {
        const userData: UserInfo = JSON.parse(user);
        return userData.nickname;
      } else return "Log-out";
    });
  }, [currentPage]);

  useEffect(() => {
    setTaskLists(taskList);
  }, [taskList]);

  const handleStartButtonClick = () => {
    setStartButtonClicked((startButtonClicked) => !startButtonClicked);
  };

  const handleActiveTaskButton = (key: number) => () => {
    const updatedTaskLists = taskLists.map((task) => ({
      ...task,
      active: false,
    }));
    if (key !== -1) updatedTaskLists[key].active = true;
    setTaskLists(updatedTaskLists);
    setActiveTaskButton(key);
    console.log("key : ", key);
    console.log(activeTaskButton);
  };

  return (
    <>
      {startButtonClicked ? <MenuList /> : null}
      <Frame
        className="fixed bottom-0 left-0 w-screen bg-gray-500 p-1 pb-2 flex items-center justify-between h-30px"
        w=""
        h=""
      >
        {/* Main */}
        <span className="flex flex-row justify-start shirink">
          {/* StartButton */}
          <Frame
            className="flex flex-row p-0.5 px-1 h-full m-1 items-center"
            onClick={handleStartButtonClick}
            boxShadow={startButtonClicked ? "in" : "out"}
          >
            <img src="/images/icon-image.png" className=" h-5"></img>
            <span className="pl-3 overflow-clip">Start</span>
          </Frame>
          {/* Page Status */}
          <Frame
            className="flex flex-row p-0.5 h-full m-1 items-center overflow-clip"
            boxShadow="in"
            bg="white"
          >
            <span className="px-7">{currentPage}</span>
          </Frame>
          {/* Current Tasks */}
          <div className="flex flex-row mx-1 overflow-clip">
            {taskLists.map((task, index) => (
              <TaskButton
                key={index}
                index={index}
                text={task.title}
                active={task.active}
                handleActiveTaskButton={handleActiveTaskButton(index)}
              />
            ))}
          </div>
        </span>
        {/* NickName */}
        <Frame
          className="flex flex-row p-0.5 h-full m-1 items-center"
          boxShadow="in"
        >
          <span className="px-2">{nickName}</span>
        </Frame>
      </Frame>
    </>
  );
};

export default TaskBar;
