import { createEntityClient } from "../utils/entityWrapper";
import schema from "./GameData.json";
export const GameData = createEntityClient("GameData", schema);
