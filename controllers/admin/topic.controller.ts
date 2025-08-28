import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { systemConfig } from "../../config/system";

export const index = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({
      deleted: false,
    });
    res.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCreateTopicPage = (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Create topic page (API only)",
    });
  } catch (error) {
    console.log(error);
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const topicRecord = new Topic(req.body);
    topicRecord.save();
    res.json({
      success: true,
      message: "Tạo mới chủ đề bài hát thành công!",
      topic: topicRecord,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Tạo mới chủ đề bài hát thất bại!",
    });
  }
};

export const getEditTopicPage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findOne({
      _id: id,
      deleted: false,
    });
    res.json({
      success: true,
      topic,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body
    );
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
    req.flash("success", "Cập nhật chủ đề bài hát thành công!");
  } catch (error) {
    console.log(error);
    res.redirect("back");
    req.flash("error", "Cập nhật chủ đề bài hát thất bại!");
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.updateOne(
      {
        _id: id,
        deleted: false,
      },
      {
        deleted: true,
      }
    );
    req.flash("success", "Xóa chủ đề bài hát thành công!");
    res.json({ code: "success" });
  } catch (error) {
    console.log(error);
    req.flash("error", "Xóa chủ đề bài hát thất bại!");
    res.json({ code: "error" });
  }
};
