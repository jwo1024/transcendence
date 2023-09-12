import {
  createContext,
  useState,
  useReducer,
  SetStateAction,
  Dispatch,
} from "react";

// have to use unique title
export interface ITask {
  title: string;
  active: boolean;
} // initdata = context ..

export type TaskListAction =
  | {
      type: "ADD";
      task: ITask;
    }
  | {
      type: "REMOVE";
      title: string;
    }
  | {
      type: "ADD_LIST";
      taskList: ITask[];
    }
  | {
      type: "MINIMIZE";
      title: string;
    }
  | {
      type: "ACTIVE";
      title: string;
    };

interface CurrentPageContextProps {
  currentPage: string;
  setCurrentPage: Dispatch<SetStateAction<string>>;
}

interface TaskListContextProps {
  taskList: ITask[];
  dispatchTaskList: Dispatch<TaskListAction>;
}

export const CurrentPageContext = createContext({} as CurrentPageContextProps);
export const TaskListContext = createContext({} as TaskListContextProps);

export const PageContext = ({ ...props }) => {
  const [currentPage, setCurrentPage] = useState("Pong-Game");
  // const [TaskLists, setTaskLists] = useState<ITaskList[]>([]); // reducer ?
  const TaskListReducer = (state: ITask[], action: TaskListAction) => {
    switch (action.type) {
      case "ADD": {
        return [...state, action.task];
      }
      case "REMOVE": {
        return state.filter((item) => item.title !== action.title);
      }
      case "ADD_LIST": {
        return [...state, ...action.taskList];
      }
      case "MINIMIZE": {
        return state.map((item) =>
          item.title === action.title ? { ...item, active: false } : item
        );
      }
      case "ACTIVE": {
        return state.map((item) =>
          item.title === action.title ? { ...item, active: true } : item
        );
      }
      default: {
        return state;
      }
    }
  };

  const [taskList, dispatchTaskList] = useReducer(TaskListReducer, []);

  return (
    <CurrentPageContext.Provider value={{ currentPage, setCurrentPage }}>
      <TaskListContext.Provider value={{ taskList, dispatchTaskList }}>
        {props.children}
      </TaskListContext.Provider>
    </CurrentPageContext.Provider>
  );
};
