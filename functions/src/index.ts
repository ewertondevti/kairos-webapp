import {
  createAlbum,
  deleteAlbum,
  deleteImageFromAlbum,
  getAlbumById,
  getAlbums,
  updateAlbum,
  uploadImage,
} from "./controllers/albumController";
import { deleteUploadedImage } from "./controllers/commonController";
import {
  createEvents,
  deleteEvents,
  getEvents,
  uploadEvent,
} from "./controllers/eventController";
import { createNewMember } from "./controllers/memberController";

export {
  createAlbum,
  createEvents,
  createNewMember,
  deleteAlbum,
  deleteEvents,
  deleteImageFromAlbum,
  deleteUploadedImage,
  getAlbumById,
  getAlbums,
  getEvents,
  updateAlbum,
  uploadEvent,
  uploadImage,
};
