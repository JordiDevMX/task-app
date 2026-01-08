// Todo es un patron agnostico para la "logica del negocio"
import * as z from "zod";
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskState {
  todos: Todo[];
  length: number;
  completed: number;
  pending: number;
}

export type TaskAction =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: number } // Valor, o argumento, de una accion
  | { type: "DELETE_TODO"; payload: number };

const TodoSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean(),
});

const TaskStateScheme = z.object({
  todos: z.array(TodoSchema),
  length: z.number(),
  completed: z.number(),
  pending: z.number(),
});

export const getTasksInitialState = (): TaskState => {
  const localStorageState = localStorage.getItem("tasks-state");

  if (!localStorageState) {
    return {
      todos: [],
      completed: 0,
      pending: 0,
      length: 0,
    };
  }

  const result = TaskStateScheme.safeParse(JSON.parse(localStorageState));

  if (result.error) {
    console.log(result.error);
    return {
      todos: [],
      completed: 0,
      pending: 0,
      length: 0,
    };
  }

  // ! Cuidado! El objeto pudo haber sido manipulado
  // return JSON.parse(localStorageState);
  return result.data;
};

export const taskReducer = (
  state: TaskState,
  action: TaskAction
): TaskState => {
  // * Analogia de como funciona esto orientada a contratos:
  // ? State = Google, todos = contratos, newTodo = nuevoContrato y payload seria "requisitos para hacer
  // ? un nuevo contrato", mi nombre por ejemplo.
  // Entonces, cuando alguien se equivoca en un contrato, como por ejemplo te equivocaste en tu firma,
  // no puedes tacharla y poner la nueva a un lado, o intentas sobre-escribir en ella para "arreglarla";
  // ! se necesita imprimir un nuevo contrato y firmarlo bien esta vez. Es lo mismo dentro de un "Reducer":
  // no se debe mutar el estado, sino actualizarlo constantemente para que React se de cuenta del cambio
  // y actualice la app
  // * En resumen: el codigo siguiente significa "contratos: [...google.contratos, nuevoContrato]" en donde
  // google ya tiene un cajon lleno de contratos y esta agregando el mio con "nuevoContrato" en donde "payload"
  // tiene todos mis datos
  switch (action.type) {
    case "ADD_TODO": {
      const newTodo: Todo = {
        id: Date.now(),
        text: action.payload,
        completed: false,
      };

      // ! Nunca se debe mutar el state
      // state.todos.push(newTodo)

      return {
        ...state,
        todos: [...state.todos, newTodo],
        length: state.todos.length + 1,
        pending: state.pending + 1,
      };
    }
    case "DELETE_TODO": {
      const updatedTodos = state.todos.filter(
        (todo) => todo.id !== action.payload
      );
      // TODO: Recalcular cuantos TO-DOs hay (length) despues de ejecutar este caso
      return {
        ...state,
        todos: updatedTodos,
        length: updatedTodos.length,
        completed: updatedTodos.filter((todo) => todo.completed).length,
        pending: updatedTodos.filter((todo) => !todo.completed).length,
      };
    }
    case "TOGGLE_TODO": {
      // TODO: Recalcular cuantos TO-DOs completados hay despues de ejecutar este caso
      const updatedTodos = state.todos.map((todo) => {
        if (todo.id === action.payload) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });

      return {
        ...state,
        todos: updatedTodos,
        completed: updatedTodos.filter((todo) => todo.completed).length,
        pending: updatedTodos.filter((todo) => !todo.completed).length,
      };
    }
    default:
      return state;
  }
};
