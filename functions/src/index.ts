import {
  createAlbum,
  deleteAlbum,
  deleteImageFromAlbum,
  getAlbumById,
  getAlbums,
  uploadImage,
} from "./controllers/albumController";
import { deleteUploadedImage } from "./controllers/commonController";
import {
  createEvents,
  deleteEvents,
  getEvents,
  uploadEvent,
} from "./controllers/eventController";
import {
  createPresentations,
  deletePresentations,
  getPresentations,
  uploadPresentation,
} from "./controllers/presentationController";

export {
  createAlbum,
  createEvents,
  createPresentations,
  deleteAlbum,
  deleteEvents,
  deleteImageFromAlbum,
  deletePresentations,
  deleteUploadedImage,
  getAlbumById,
  getAlbums,
  getEvents,
  getPresentations,
  uploadEvent,
  uploadImage,
  uploadPresentation,
};
