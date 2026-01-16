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
import { createAuditLog } from "./controllers/auditController";
import {
  createUser,
  getUserProfile,
  getUsers,
  getAccessRequests,
  requestAccess,
  syncUserClaims,
  setUserRole,
  setUserActive,
  updateUserProfile,
  updateAccessRequestStatus,
} from "./controllers/userController";

export {
  createAuditLog,
  createAlbum,
  createEvents,
  createUser,
  deleteAlbum,
  deleteEvents,
  deleteImageFromAlbum,
  deleteUploadedImage,
  getUserProfile,
  getUsers,
  getAccessRequests,
  getAlbumById,
  getAlbums,
  getEvents,
  requestAccess,
  syncUserClaims,
  setUserRole,
  setUserActive,
  updateAlbum,
  updateUserProfile,
  updateAccessRequestStatus,
  uploadEvent,
  uploadImage,
};
