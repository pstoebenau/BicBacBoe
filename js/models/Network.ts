import BoardData from "./BoardData";

export interface ConnData {
  method: 'Game Request' | 'Game Accept' | 'Game Accept Acknowledge' | 'Game Reject' | 'Board Data';
}

export interface GameRequest extends ConnData {
  username: string;
}

export interface GameAccept extends ConnData {
  username: string;
}

export interface GameReject extends ConnData {
  username: string;
}

export interface BoardDataNetwork extends ConnData {
  boardData: BoardData;
}