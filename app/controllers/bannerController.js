import Banner from "../models/bannerModel.js";
import dotenv from "dotenv";
import { uploadToImgBB } from "../config/multer/productUploads.js";
dotenv.config();

const getImages = async (files) => {
  if (!files || files.length === 0) return null;
  if (process.env.NODE_ENV === "production") {
    return await Promise.all(files.map((file) => uploadToImgBB(file)));
  }
  return files.map((file) => file.filename);
};

const createBanner = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: false, message: "Imagem é obrigatória" });
    }

    const images = await getImages(req.files);

    const banner = await Banner.create({
      images,
      description: req.body.description || null,
      active: req.body.active ?? true,
    });

    res.status(201).json({ status: true, data: banner });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true });
    res.status(200).json({ status: true, count: banners.length, data: banners });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: "Banner não encontrado" });
    res.status(200).json({ status: true, data: banner });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const hasBody = Object.keys(req.body).length > 0;
    const hasFiles = req.files && req.files.length > 0;

    if (!hasBody && !hasFiles) {
      return res.status(400).json({
        status: false,
        message: "Informe pelo menos um campo para atualizar.",
      });
    }

    let data = { ...req.body };

    const images = await getImages(req.files);
    if (images) data.images = images;

    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!banner) return res.status(404).json({ status: false, message: "Banner não encontrado" });

    res.status(200).json({ status: true, data: banner });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: "Banner não encontrado" });

    banner.active = !banner.active;
    await banner.save();

    res.status(200).json({
      status: true,
      message: `Banner ${banner.active ? "ativado" : "desativado"} com sucesso`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: "Banner não encontrado" });

    res.status(200).json({ status: true, message: "Banner removido com sucesso" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export { createBanner, getBanners, getBannerById, updateBanner, toggleBanner, deleteBanner };