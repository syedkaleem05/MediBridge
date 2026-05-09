import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectMongo } from "../lib/mongodb.js";
import { User } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { Medicine } from "../models/Medicine.js";
import { Inventory } from "../models/Inventory.js";
import { PurchaseHistory } from "../models/PurchaseHistory.js";
import { CustomerLedger } from "../models/CustomerLedger.js";
import { DEMO_MEDICINES, DEMO_PHARMACY_LOCATIONS } from "../lib/demo.js";

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  await connectMongo();

  // Ensure indexes match current schemas (helps after schema changes)
  try {
    await Pharmacy.collection.dropIndex("ownerId_1");
  } catch {
    // ignore if missing
  }
  await Pharmacy.syncIndexes();

  // wipe demo collections (MVP-friendly)
  await Promise.all([
    User.deleteMany({
      email: {
        $in: [
          "owner@demo.com",
          "user@demo.com",
          "ahmad@demo.com",
          "daim@demo.com",
          "syed@demo.com",
          "farhaan@demo.com",
        ],
      },
    }),
  ]);

  // Ensure medicines exist
  const medicines = [];
  for (const m of DEMO_MEDICINES) {
    const doc = await Medicine.findOneAndUpdate(
      { barcode: m.barcode },
      { $set: m },
      { upsert: true, new: true },
    );
    medicines.push(doc);
  }

  // Demo owner (with pharmacy)
  const ownerPass = await bcrypt.hash("Demo@123", 10);
  const owner = await User.create({
    name: "Demo Owner",
    email: "owner@demo.com",
    password: ownerPass,
    role: "owner",
  });

  const loc = DEMO_PHARMACY_LOCATIONS[0];
  const pharmacy = await Pharmacy.create({
    ownerId: owner._id,
    pharmacyName: loc.pharmacyName,
    address: loc.address,
    latitude: loc.latitude,
    longitude: loc.longitude,
    phone: loc.phone,
    openingHours: loc.openingHours,
    areaLabel: loc.areaLabel,
  });
  owner.pharmacyId = pharmacy._id;
  await owner.save();

  // Create extra pharmacies (no owners needed for discovery demo)
  const extraPharmacies = [];
  for (let i = 1; i < DEMO_PHARMACY_LOCATIONS.length; i++) {
    const l = DEMO_PHARMACY_LOCATIONS[i];
    const p = await Pharmacy.findOneAndUpdate(
      { pharmacyName: l.pharmacyName },
      { $set: { ...l, ownerId: null } },
      { upsert: true, new: true },
    );
    extraPharmacies.push(p);
  }

  // Demo normal user
  const userPass = await bcrypt.hash("Demo@123", 10);
  const demoUser = await User.create({
    name: "Demo User",
    email: "user@demo.com",
    password: userPass,
    role: "user",
  });

  const demoCustomers = await User.insertMany([
    {
      name: "Ahmad Murtaza Khan",
      email: "ahmad@demo.com",
      password: userPass,
      role: "user",
    },
    {
      name: "Sheikh Ahmad Abdul Daim",
      email: "daim@demo.com",
      password: userPass,
      role: "user",
    },
    {
      name: "Syed Kaleem Ul Haq",
      email: "syed@demo.com",
      password: userPass,
      role: "user",
    },
    {
      name: "Farhaan Ghasi",
      email: "farhaan@demo.com",
      password: userPass,
      role: "user",
    },
  ]);

  // Seed inventory across pharmacies
  const allPharmacies = [pharmacy, ...extraPharmacies];
  await Inventory.deleteMany({ pharmacyId: { $in: allPharmacies.map((p) => p._id) } });

  const batches = [
    { batchNumber: "MB-APR-01", expiryDate: daysFromNow(120) },
    { batchNumber: "MB-MAY-02", expiryDate: daysFromNow(25) }, // expiring
    { batchNumber: "MB-MAR-03", expiryDate: daysFromNow(-10) }, // expired
  ];

  for (const p of allPharmacies) {
    for (const m of medicines) {
      const b = batches[Math.floor(Math.random() * batches.length)];
      const qty = Math.floor(Math.random() * 40);
      const price = 25 + Math.floor(Math.random() * 120);
      await Inventory.create({
        pharmacyId: p._id,
        medicineId: m._id,
        quantity: qty,
        price,
        expiryDate: b.expiryDate,
        batchNumber: `${b.batchNumber}-${m.barcode}-${String(p._id).slice(-4)}`,
        inStock: qty > 0,
      });
    }
  }

  // Seed customer purchase history + simple ledger data for dashboard demos
  const customers = [demoUser, ...demoCustomers];
  await PurchaseHistory.deleteMany({ userId: { $in: customers.map((c) => c._id) } });
  await CustomerLedger.deleteMany({ customerId: { $in: customers.map((c) => c._id) } });

  const medsByName = new Map(medicines.map((m) => [m.medicineName.toLowerCase(), m]));
  const medSamples = [
    medsByName.get("dolo 650"),
    medsByName.get("crocin"),
    medsByName.get("cetirizine"),
    medsByName.get("azithromycin"),
  ].filter(Boolean);

  const rand = (n) => Math.floor(Math.random() * n);
  for (const customer of customers) {
    let runningDue = 0;
    const txns = [];
    const txCount = 4 + rand(3);
    for (let i = 0; i < txCount; i++) {
      const med = medSamples[i % medSamples.length] || medicines[rand(medicines.length)];
      const p = allPharmacies[i % allPharmacies.length];
      const quantity = 1 + rand(3);
      const amount = (25 + rand(180)) * quantity;
      const purchaseDate = daysFromNow(-1 * (2 + i * 3 + rand(2)));
      const duePart = Math.floor(amount * (0.2 + rand(40) / 100));
      runningDue += duePart;

      await PurchaseHistory.create({
        userId: customer._id,
        pharmacyId: p._id,
        medicineId: med._id,
        medicineName: med.medicineName,
        medicineImage: med.image || "",
        quantity,
        amount,
        purchaseDate,
      });

      txns.push({
        medicineName: med.medicineName,
        quantity,
        amount,
        pendingDueAfterTxn: runningDue,
        createdAt: purchaseDate,
      });
    }

    await CustomerLedger.findOneAndUpdate(
      { customerId: customer._id, pharmacyId: pharmacy._id },
      {
        $set: {
          totalDue: runningDue,
          transactions: txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seed complete.");
  console.log("Demo accounts:");
  console.log("- owner@demo.com / Demo@123 (owner)");
  console.log("- user@demo.com / Demo@123 (user)");
  console.log("- ahmad@demo.com / Demo@123 (user)");
  console.log("- daim@demo.com / Demo@123 (user)");
  console.log("- syed@demo.com / Demo@123 (user)");
  console.log("- farhaan@demo.com / Demo@123 (user)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

