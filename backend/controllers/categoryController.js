// @ts-nocheck
const { supabase, supabaseAdmin } = require("../config/supabase");

const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "نام دسته‌بندی الزامی است",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "دسته‌بندی با موفقیت اضافه شد.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.staus(200).json({
      success: true,
      message: "دسته‌بندی با موفقیت حذف شذ.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };
