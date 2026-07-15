import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { prisma } from "../config/prisma.js";
import { assertStrongPassword, hashPassword } from "../utils/password.js";

dotenv.config();

const demoPassword = process.env.DEMO_PASSWORD || "SwapWear123";

const users = [
  {
    email: "admin@swapwear.local",
    role: "ADMIN",
    fullName: "SwapWear Admin",
    city: "Indore",
  },
  {
    email: "aisha@swapwear.local",
    role: "USER",
    fullName: "Aisha Sharma",
    city: "Mumbai",
  },
  {
    email: "rohan@swapwear.local",
    role: "USER",
    fullName: "Rohan Mehta",
    city: "Delhi",
  },
  {
    email: "meera@swapwear.local",
    role: "USER",
    fullName: "Meera Kapoor",
    city: "Bengaluru",
  },
];

const listings = [
  {
    owner: "aisha@swapwear.local",
    title: "Denim Overshirt",
    brand: "Zara",
    category: "Shirts",
    size: "M",
    condition: "Like New",
    location: "Mumbai",
    points: 1200,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80",
    description: "Structured denim overshirt with a clean everyday fit.",
  },
  {
    owner: "aisha@swapwear.local",
    title: "Minimal White Sneakers",
    brand: "H&M",
    category: "Shoes",
    size: "8",
    condition: "Good",
    location: "Mumbai",
    points: 1800,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    description: "White sneakers for casual swaps.",
  },
  {
    owner: "rohan@swapwear.local",
    title: "Vintage Leather Jacket",
    brand: "Levis",
    category: "Jackets",
    size: "L",
    condition: "Excellent",
    location: "Delhi",
    points: 3200,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    description: "Premium jacket with a vintage profile.",
  },
  {
    owner: "rohan@swapwear.local",
    title: "Fastrack Black Watch",
    brand: "Fastrack",
    category: "Accessories",
    size: "Free Size",
    condition: "Good",
    location: "Delhi",
    points: 2400,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Everyday watch, clean dial, working condition.",
  },
  {
    owner: "meera@swapwear.local",
    title: "White Cotton Kurta",
    brand: "Fabindia",
    category: "Ethnic",
    size: "S",
    condition: "Like New",
    location: "Bengaluru",
    points: 1600,
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80",
    description: "Soft cotton kurta, ideal for summer styling.",
  },
  {
    owner: "meera@swapwear.local",
    title: "Pastel Hoodie",
    brand: "Uniqlo",
    category: "Hoodies",
    size: "M",
    condition: "Excellent",
    location: "Bengaluru",
    points: 1500,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    description: "Soft hoodie in a subtle pastel shade.",
  },
];

async function upsertUser(row, passwordHash) {
  return prisma.user.upsert({
    where: { email: row.email },
    update: {
      passwordHash,
      role: row.role,
      status: "ACTIVE",
      profile: {
        upsert: {
          create: {
            fullName: row.fullName,
            city: row.city,
            provider: "email",
          },
          update: {
            fullName: row.fullName,
            city: row.city,
          },
        },
      },
    },
    create: {
      email: row.email,
      passwordHash,
      role: row.role,
      status: "ACTIVE",
      profile: {
        create: {
          fullName: row.fullName,
          city: row.city,
          provider: "email",
        },
      },
    },
    include: { profile: true },
  });
}

async function upsertListing(row, owner) {
  const existing = await prisma.listing.findFirst({
    where: { userId: owner.id, title: row.title },
  });

  const data = {
    title: row.title,
    brand: row.brand,
    category: row.category,
    size: row.size,
    condition: row.condition,
    location: row.location,
    points: row.points,
    image: row.image,
    images: [row.image],
    description: row.description,
    ownerName: owner.profile?.fullName || owner.email.split("@")[0],
    userId: owner.id,
    swapStatus: "AVAILABLE",
    isPublic: true,
  };

  if (existing) {
    return prisma.listing.update({
      where: { id: existing.id },
      data: {
        ...data,
        activeSwapId: null,
        swapCompletedAt: null,
        archiveAfter: null,
        archivedAt: null,
        deleteEligibleAt: null,
      },
    });
  }

  return prisma.listing.create({ data });
}

async function upsertAddress(user) {
  const existing = await prisma.address.findFirst({
    where: { userId: user.id, label: "Demo Home" },
  });

  const data = {
    userId: user.id,
    label: "Demo Home",
    fullName: user.profile?.fullName || user.email.split("@")[0],
    phone: "9999999999",
    line1: "Demo Street 1",
    city: user.profile?.city || "Indore",
    state: "Madhya Pradesh",
    postalCode: "452001",
    country: "India",
    isDefault: true,
  };

  if (existing) return prisma.address.update({ where: { id: existing.id }, data });
  return prisma.address.create({ data });
}

async function seedSwap(userMap, listingMap) {
  const requester = userMap.get("aisha@swapwear.local");
  const owner = userMap.get("rohan@swapwear.local");
  const requesterItem = listingMap.get("Denim Overshirt");
  const ownerItem = listingMap.get("Vintage Leather Jacket");

  const existing = await prisma.swap.findFirst({
    where: {
      requesterId: requester.id,
      ownerId: owner.id,
      requesterItemId: requesterItem.id,
      ownerItemId: ownerItem.id,
      status: { in: ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "DISPUTED"] },
    },
  });

  if (existing) return existing;

  return prisma.swap.create({
    data: {
      requesterId: requester.id,
      ownerId: owner.id,
      requesterName: requester.profile?.fullName || "Aisha",
      ownerName: owner.profile?.fullName || "Rohan",
      requesterItemId: requesterItem.id,
      ownerItemId: ownerItem.id,
      requesterItem: {
        id: String(requesterItem.id),
        title: requesterItem.title,
        brand: requesterItem.brand,
        size: requesterItem.size,
        image: requesterItem.image,
        points: requesterItem.points,
      },
      ownerItem: {
        id: String(ownerItem.id),
        title: ownerItem.title,
        brand: ownerItem.brand,
        size: ownerItem.size,
        image: ownerItem.image,
        points: ownerItem.points,
      },
      status: "PENDING",
      message: "Would love to swap this for your jacket.",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      events: {
        create: {
          actorId: requester.id,
          eventType: "demo_requested",
          metadata: { source: "seed:demo" },
        },
      },
    },
  });
}

async function seedConversation(swap, userMap) {
  const conversation = await prisma.chatConversation.upsert({
    where: { swapId: swap.id },
    update: { user1Id: swap.requesterId, user2Id: swap.ownerId },
    create: {
      swapId: swap.id,
      user1Id: swap.requesterId,
      user2Id: swap.ownerId,
      lastMessage: "Demo chat is ready.",
    },
  });

  const existingMessage = await prisma.chatMessage.findFirst({
    where: { conversationId: conversation.id, message: "Demo chat is ready." },
  });

  if (!existingMessage) {
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userMap.get("aisha@swapwear.local").id,
        message: "Demo chat is ready.",
      },
    });
  }
}

async function seedReport(userMap, listingMap) {
  const reporter = userMap.get("meera@swapwear.local");
  const listing = listingMap.get("Fastrack Black Watch");

  const existing = await prisma.report.findFirst({
    where: {
      reporterId: reporter.id,
      listingId: listing.id,
      reason: "Demo report for admin queue.",
    },
  });

  if (existing) return;

  await prisma.report.create({
    data: {
      reporterId: reporter.id,
      reportedUserId: listing.userId,
      listingId: listing.id,
      reportType: "listing",
      reason: "Demo report for admin queue.",
    },
  });
}

async function seedNotifications(userMap) {
  for (const user of userMap.values()) {
    const existing = await prisma.notification.findFirst({
      where: { userId: user.id, type: "demo_welcome" },
    });
    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "demo_welcome",
        title: "Welcome to SwapWear",
        message: "Demo data is ready for your production flow checks.",
        link: "/dashboard",
        data: { source: "seed:demo" },
      },
    });
  }
}

export async function main() {
  assertStrongPassword(demoPassword);
  const passwordHash = await hashPassword(demoPassword);

  const userMap = new Map();
  for (const row of users) {
    const user = await upsertUser(row, passwordHash);
    userMap.set(row.email, user);
    await upsertAddress(user);
  }

  const listingMap = new Map();
  for (const row of listings) {
    const listing = await upsertListing(row, userMap.get(row.owner));
    listingMap.set(row.title, listing);
  }

  const swap = await seedSwap(userMap, listingMap);
  await seedConversation(swap, userMap);
  await seedReport(userMap, listingMap);
  await seedNotifications(userMap);

  console.log("Demo seed ready");
  console.log(`Demo password: ${demoPassword}`);
  console.log("Users:");
  for (const row of users) console.log(`- ${row.email} (${row.role})`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
