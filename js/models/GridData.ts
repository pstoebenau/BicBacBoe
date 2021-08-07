import Grid from "../BicBacBoe/Grid";

export default interface GridData {
  closed: boolean;
  selectable: boolean;
  moves: [string[], string[], string[]];
  children: [GridData[], GridData[], GridData[]];
}
