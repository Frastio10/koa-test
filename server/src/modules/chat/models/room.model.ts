import sequelize from "../../../config/db";
import { DataTypes } from "sequelize";

const Room = sequelize.define("Room", {
  uniqueCode: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  memberIds: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: [],
  },
});

Room.sync();

export default Room;
