import sequelize from "../../../config/db";
import { DataTypes } from "sequelize";
import User from "../../user/models/user.model";
import Room from "./room.model";

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  roomId: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: "id",
    },
  },

  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.sync();

Message.belongsTo(User, { foreignKey: "senderId", as: "User" });
User.hasMany(Message, { foreignKey: "senderId", as: "Messages" });

Room.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });
User.hasMany(Room, { foreignKey: "ownerId", as: "rooms" });

// User.hasMany(Message, { foreignKey: "senderId" });

export default Message;
