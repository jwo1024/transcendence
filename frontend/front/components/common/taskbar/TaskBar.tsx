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

    console.log(activeTaskButton);
  };

  return (
    <>
      {startButtonClicked ? <MenuList /> : null}
      {/* Main */}
      <Frame
        className="flex flex-row fixed bottom-0 left-0 w-screen bg-gray-500 p-1 pb-2 items-center justify-between h-10"
        w=""
        h=""
      >
        <div className="flex flex-row items-center justify-center h-full space-x-1">
          {/* StartButton */}
          <Frame
            className="flex flex-row px-2 items-center justify-center"
            onClick={handleStartButtonClick}
            boxShadow={startButtonClicked ? "in" : "out"}
            h="100%"
          >
            <img src="/images/icon-image.png" className=" h-5"></img>
            <span className="pl-3 overflow-clip">Start</span>
          </Frame>
          {/* Page Status */}
          <Frame
            className="flex flex-row px-3 m-1 items-center justify-center text-lg"
            boxShadow="in"
            bg="white"
            h="100%"
          >
            {currentPage}
          </Frame>
          {/* Current Tasks */}
          <div className="flex flex-row h-full items-center space-x-1">
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
        </div>
        {/* NickName */}
        <Frame
          className="flex flex-row px-3 items-center text-md"
          boxShadow="in"
          h="100%"
        >
          {nickName}
        </Frame>
      </Frame>
    </>
  );
};

export default TaskBar;
