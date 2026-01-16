import {
  createAlbum,
  deleteAlbum,
  deleteImageFromAlbum,
  getAlbumById,
  getAlbums,
  updateAlbum,
  uploadImage,
} from "./controllers/albumController";
import {deleteUploadedImage} from "./controllers/commonController";
import {
  createEvents,
  deleteEvents,
  getEvents,
  uploadEvent,
} from "./controllers/eventController";
import {createNewMember} from "./controllers/memberController";
import {
  createUser,
  getUserProfile,
  getUsers,
  requestAccess,
  syncUserClaims,
  setUserRole,
  setUserActive,
  updateUserProfile,
} from "./controllers/userController";

export {
  createAlbum,
  createEvents,
  createNewMember,
  createUser,
  deleteAlbum,
  deleteEvents,
  deleteImageFromAlbum,
  deleteUploadedImage,
  getUserProfile,
  getUsers,
  getAlbumById,
  getAlbums,
  getEvents,
  requestAccess,
  syncUserClaims,
  setUserRole,
  setUserActive,
  updateAlbum,
  updateUserProfile,
  uploadEvent,
  uploadImage,
};
