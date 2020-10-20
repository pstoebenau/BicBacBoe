import BoardData from "./BoardData";

export default interface Player {
    username: string;
    id: number;
    opponentID: number;
    playerMark: number;
    boardData: BoardData;
}
