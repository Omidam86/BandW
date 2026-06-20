// @ts-nocheck
const { supabase, supabaseAdmin } = require("../config/supabase");

// Publish Controllers

const getPosts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "پست مورد نظر یافت نشد",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, category, body } = req.body;

    if (!title || !category || !body) {
      return res.status(400).json({
        success: false,
        message: "عنوان، دسته‌بندی و متن مقاله الزامی است",
      });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ title, category, body, status: "pending" }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "پست با موفقیت ارسال شد و بعد از بررسی منتشر خواهد شد",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers

const getPendingPosts = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    if (updates.view_count === null || updates.view_count_increment) {
      const { data: post } = await supabaseAdmin
        .from("posts")
        .select("view_count")
        .eq("id", id)
        .single();

      updates = { view_count: (post?.view_count || 0) + 1 };
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data)
      return res.status(404).json({ success: false, message: "پست یافت نشد" });

    res.json({ success: true, message: "به‌روزرسانی شد", data });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({ success: true, message: "پست با موفقیت حذف شذ." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  getPendingPosts,
  updatePost,
  deletePost,
};
