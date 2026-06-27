import { Router } from "express";
import * as auth from "../controllers/authController.js";
import * as volunteers from "../controllers/volunteerController.js";
import * as emergency from "../controllers/emergencyController.js";
import * as donations from "../controllers/donationController.js";
import * as admin from "../controllers/adminController.js";
import * as ngo from "../controllers/ngoController.js";
import * as resources from "../controllers/resourceController.js";
import * as publicData from "../controllers/publicController.js";
import * as ngoDashboard from "../controllers/ngoDashboardController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { uploadDocuments, uploadEmergencyAudio } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/auth/register", auth.register);
router.post("/auth/signup-profile", uploadDocuments.array("documents", 5), auth.signupProfile);
router.post("/auth/login", auth.login);
router.get("/auth/me", protect, auth.me);
router.patch("/auth/me", protect, auth.updateMe);

router.post("/ngos/register", ngo.registerNgo);
router.get("/ngos", admin.listNgos);

router.get("/ngo/dashboard", protect, requireRole("ngo"), ngoDashboard.dashboard);
router.patch("/ngo/requests/:id/accept", protect, requireRole("ngo"), ngoDashboard.acceptRequest);
router.patch("/ngo/requests/:id/status", protect, requireRole("ngo"), ngoDashboard.updateRequestStatus);
router.patch("/ngo/requests/:id/assign", protect, requireRole("ngo"), ngoDashboard.assignVolunteer);
router.post("/ngo/resources", protect, requireRole("ngo"), ngoDashboard.createResource);
router.patch("/ngo/resources/:id", protect, requireRole("ngo"), ngoDashboard.updateResource);
router.delete("/ngo/resources/:id", protect, requireRole("ngo"), ngoDashboard.deleteResource);

router.get("/volunteers", volunteers.listVolunteers);
router.post("/volunteers", volunteers.createVolunteer);
router.post("/volunteers/register", volunteers.registerVolunteer);
router.get("/volunteers/leaderboard", volunteers.leaderboard);
router.get("/volunteers/stories", volunteers.listStories);
router.post("/volunteers/stories", protect, volunteers.createStory);
router.get("/volunteers/:id/tasks", protect, volunteers.volunteerTasks);

router.get("/emergency-requests", emergency.listRequests);
router.post("/emergency-requests", uploadEmergencyAudio.single("audio"), emergency.createRequest);
router.patch("/emergency-requests/:id/status", protect, emergency.updateStatus);
router.patch("/emergency-requests/:id/assign", protect, emergency.assignVolunteer);
router.post("/emergency-requests/:id/progress", protect, emergency.addProgress);

router.get("/payment/config", donations.paymentConfig);
router.post("/create-order", donations.createOrder);
router.post("/verify-payment", donations.verifyPayment);
router.post("/donations", donations.createOfflineDonation);
router.get("/donations", donations.listDonations);
router.get("/donations/recent", donations.recentDonations);

router.get("/admin/overview", admin.overview);
router.get("/admin/users", protect, requireRole("admin"), admin.listUsers);
router.get("/admin/ngos", admin.listNgos);
router.patch("/admin/ngos/:id/verify", protect, requireRole("admin"), admin.verifyNgo);
router.get("/admin/volunteer-applications", protect, requireRole("admin"), admin.listVolunteerApplications);
router.patch("/admin/volunteers/:id/assign-ngo", protect, requireRole("admin"), admin.assignNgoToVolunteer);
router.post("/admin/allocations", protect, requireRole("admin"), admin.createAllocation);
router.get("/admin/ngo-operations", admin.ngoOperations);

router.get("/resources", resources.listResources);
router.post("/resources", protect, resources.createResource);
router.patch("/resources/:id", protect, resources.updateResource);
router.delete("/resources/:id", protect, resources.deleteResource);

router.get("/stats", publicData.stats);
router.get("/campaigns", publicData.campaigns);
router.get("/disasters/active", publicData.activeDisasters);
router.get("/communication", publicData.listCommunication);
router.post("/communication", protect, publicData.createCommunication);

export default router;
