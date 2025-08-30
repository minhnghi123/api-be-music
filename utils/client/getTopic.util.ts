import Topic from "../../models/topic.model.js";
export const getFullTopics = async () => {
  const topics = await Topic.find({
    deleted: false,
  });
  return topics;
};
