export interface ConnData {
  method: string;
}

export interface GameRequest extends ConnData {
  username: string;
}