import Banner from "../models/bannerModel.js";
import dotenv from "dotenv";
import { uploadToImgBB } from "../config/multer/productUploads.js";
dotenv.config();

const createBanner = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Imagem é obrigatória" });
    }

    let images;
    if (process.env.NODE_ENV === "production") {
      const uploadPromises = req.files.map((file) => uploadToImgBB(file));
      images = await Promise.all(uploadPromises);
    } else {
      images = req.files.map((file) => file.path);
    }

  const banner = await Banner.create({
  images: images, // array completo
  description: req.body.description || null,
  active: req.body.active ?? true,
});

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    let data = { ...req.body };

    if (req.files && req.files.length > 0) {
      if (process.env.NODE_ENV === "production") {
        const uploadPromises = req.files.map((file) => uploadToImgBB(file));
        data.images = await Promise.all(uploadPromises);
      } else {
        data.images = req.files.map((file) => file.path);
      }
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!banner) return res.status(404).json({ message: "Banner não encontrado" });

    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner não encontrado" });

    res.status(200).json({ message: "Banner removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createBanner, getBanners, updateBanner, deleteBanner };