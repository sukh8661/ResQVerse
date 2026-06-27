import Campaign from "../models/Campaign.js";
import Disaster from "../models/Disaster.js";
import Donation from "../models/Donation.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import FundAllocation from "../models/FundAllocation.js";
import Ngo from "../models/Ngo.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import VolunteerStory from "../models/VolunteerStory.js";
import Communication from "../models/Communication.js";
import { hashPassword } from "../utils/auth.js";

export async function seedDatabase() {
  const existingAdmin = await User.findOne({ email: "admin@resqverse.local" });
  if (existingAdmin) return;

  const [adminUser, ngoUser, volunteerUser, volunteerUserTwo] = await User.create([
    {
      username: "admin",
      email: "admin@resqverse.local",
      fullName: "ResQVerse Admin",
      role: "admin",
      passwordHash: await hashPassword("admin123")
    },
    {
      username: "ngo",
      email: "ngo@resqverse.local",
      phone: "+919876543210",
      fullName: "Relief Bridge Foundation",
      role: "ngo",
      address: "Sector 17, Chandigarh",
      passwordHash: await hashPassword("ngo123")
    },
    {
      username: "asha.volunteer",
      email: "asha.volunteer@resqverse.local",
      phone: "+919900001111",
      fullName: "Asha Sharma",
      role: "volunteer",
      address: "Mohali, Punjab",
      passwordHash: await hashPassword("volunteer123")
    },
    {
      username: "ravi.volunteer",
      email: "ravi.volunteer@resqverse.local",
      phone: "+919900002222",
      fullName: "Ravi Kumar",
      role: "volunteer",
      address: "Chandigarh",
      passwordHash: await hashPassword("volunteer123")
    }
  ]);

  const ngo = await Ngo.create({
    user: ngoUser._id,
    organizationName: "Relief Bridge Foundation",
    registrationId: "RBF-2026-001",
    contactPerson: "Relief Coordinator",
    email: ngoUser.email,
    phone: ngoUser.phone,
    location: "Chandigarh, India",
    address: ngoUser.address,
    description: "Verified NGO partner coordinating food, water, medical aid, and evacuation support.",
    isVerified: true,
    kycStatus: "verified",
    warehouses: [
      { name: "Chandigarh Relief Store", location: "Industrial Area Phase I", capacity: 12000 },
      { name: "Mohali Rapid Depot", location: "Sector 82, Mohali", capacity: 8000 }
    ],
    vehicles: [
      { type: "ambulance", count: 2, available: 1 },
      { type: "supply_van", count: 5, available: 4 }
    ]
  });

  const [volunteerOne, volunteerTwo] = await Volunteer.create([
    {
      user: volunteerUser._id,
      skills: ["Medical Training", "Food Service", "Communication & Coordination"],
      availability: "emergency_only",
      location: "Mohali, Punjab",
      city: "Mohali",
      state: "Punjab",
      coordinates: { lat: 30.7046, lng: 76.7179 },
      vehicleType: "car",
      ngo: ngo._id,
      status: "available",
      verificationStatus: "verified",
      creditPoints: 120,
      totalResponses: 5,
      consentGiven: true
    },
    {
      user: volunteerUserTwo._id,
      skills: ["Search & Rescue", "Logistics & Transport"],
      availability: "part_time",
      location: "Chandigarh",
      city: "Chandigarh",
      state: "Chandigarh",
      coordinates: { lat: 30.7333, lng: 76.7794 },
      vehicleType: "truck",
      ngo: ngo._id,
      status: "available",
      verificationStatus: "verified",
      creditPoints: 85,
      totalResponses: 3,
      consentGiven: true
    }
  ]);

  const [requestOne, requestTwo] = await EmergencyRequest.create([
    {
      title: "Food Emergency - critical Priority",
      type: "food",
      urgency: "critical",
      description: "Families need food packets and drinking water after local flooding.",
      location: "Phase 7, Mohali",
      peopleCount: 24,
      coordinates: { lat: 30.7102, lng: 76.7083 },
      requesterName: "Community Lead",
      requesterPhone: "+919811112222",
      status: "assigned",
      assignedVolunteer: volunteerOne._id,
      assignedNgo: ngo._id,
      progress: [{ status: "assigned", note: "Assigned to medical and relief volunteer", volunteer: volunteerOne._id }]
    },
    {
      title: "Medical Emergency - medium Priority",
      type: "medical",
      urgency: "medium",
      description: "Elderly residents require first aid and medicine delivery.",
      location: "Sector 22, Chandigarh",
      peopleCount: 8,
      coordinates: { lat: 30.7353, lng: 76.7793 },
      status: "pending"
    }
  ]);

  await Resource.create([
    { type: "food", quantity: 1500, available: 1120, distributed: 380, unit: "packets", ngo: ngo._id },
    { type: "water", quantity: 2500, available: 1900, distributed: 600, unit: "bottles", ngo: ngo._id },
    { type: "medical", quantity: 450, available: 320, distributed: 130, unit: "kits", ngo: ngo._id },
    { type: "blankets", quantity: 700, available: 610, distributed: 90, unit: "pieces", ngo: ngo._id }
  ]);

  const [donationOne, donationTwo] = await Donation.create([
    {
      amount: 5000,
      currency: "INR",
      donationType: "food",
      donorData: { name: "Simran Kaur", phone: "+919812345670", email: "simran@example.com" },
      status: "successful",
      orderId: "seed_order_food",
      paymentId: "seed_payment_food"
    },
    {
      amount: 10000,
      currency: "INR",
      donationType: "medical",
      donorData: { name: "Anonymous", phone: "Anonymous" },
      isAnonymous: true,
      status: "successful",
      orderId: "seed_order_medical",
      paymentId: "seed_payment_medical"
    }
  ]);

  await FundAllocation.create({
    donation: donationOne._id,
    ngo: ngo._id,
    amount: 3000,
    purpose: "Food packets for Mohali flood response",
    createdBy: adminUser._id
  });

  await Campaign.create({
    title: "North India Monsoon Relief",
    description: "Emergency supplies, medical support, and safe shelter for affected families.",
    targetAmount: 500000,
    raisedAmount: donationOne.amount + donationTwo.amount,
    status: "active"
  });

  await Disaster.create([
    {
      title: "Heavy Rainfall Alert",
      location: "Punjab and Chandigarh",
      severity: "high",
      description: "Localized flooding risk. Relief teams are monitoring high-risk areas."
    },
    {
      title: "Heatwave Support Watch",
      location: "Northern India",
      severity: "medium",
      description: "Water distribution support available for vulnerable communities."
    }
  ]);

  await VolunteerStory.create({
    volunteer: volunteerOne._id,
    title: "First response in Mohali",
    story: "Our team delivered food packets and checked on elderly residents within the first response window."
  });

  await Communication.create({
    senderName: "Operations",
    message: `Request ${requestOne.title} is assigned. ${requestTwo.title} is awaiting volunteer assignment.`,
    createdBy: adminUser._id
  });

  console.log("Seeded ResQVerse database with initial records");
}
