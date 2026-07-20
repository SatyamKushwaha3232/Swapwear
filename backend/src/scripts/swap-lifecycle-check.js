import { pathToFileURL } from "node:url";

import { prisma } from "../config/prisma.js";
import { createSwapRequest, updateSwapStatus } from "../services/swap.service.js";

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const requesterEmail = `swap-check-requester-${suffix}@swapwear.local`;
const ownerEmail = `swap-check-owner-${suffix}@swapwear.local`;

async function createUser(email, role = "USER") {
  return prisma.user.create({
    data: {
      email,
      passwordHash: "swap-lifecycle-check",
      role,
      emailVerified: true,
      profile: {
        create: {
          fullName: email.split("@")[0],
          provider: "test",
        },
      },
    },
    include: { profile: true },
  });
}

async function createListing(user, title) {
  return prisma.listing.create({
    data: {
      title,
      brand: "SwapWear QA",
      category: "Test",
      size: "M",
      condition: "Good",
      location: "Local QA",
      points: 100,
      image: "/icons.svg",
      images: ["/icons.svg"],
      userId: user.id,
      ownerName: user.profile?.fullName || user.email,
    },
  });
}

export async function main() {
  let requester;
  let owner;
  let requesterListing;
  let ownerListing;
  let swap;

  try {
    requester = await createUser(requesterEmail, "ADMIN");
    owner = await createUser(ownerEmail, "USER");
    requesterListing = await createListing(requester, "Requester QA Jacket");
    ownerListing = await createListing(owner, "Owner QA Hoodie");

    swap = await createSwapRequest(
      {
        requesterItem: { id: String(requesterListing.id) },
        ownerItem: { id: String(ownerListing.id) },
        message: "Lifecycle permission check",
      },
      requester
    );

    let requesterWasBlocked = false;
    try {
      await updateSwapStatus(swap.id, "accepted", requester);
    } catch (error) {
      requesterWasBlocked = error.status === 403;
    }

    if (!requesterWasBlocked) {
      throw new Error("Requester was able to accept their own swap request");
    }

    const accepted = await updateSwapStatus(swap.id, "accepted", owner);
    if (accepted.status !== "accepted") {
      throw new Error("Owner could not accept the incoming swap request");
    }

    console.log("Swap lifecycle check passed");
    console.log("- requester self-accept blocked");
    console.log("- owner accept allowed");
  } finally {
    const userIds = [requester?.id, owner?.id].filter(Boolean);
    const listingIds = [requesterListing?.id, ownerListing?.id].filter(Boolean);
    const swapIds = [swap?.id].filter(Boolean);

    await prisma.notification.deleteMany({
      where: {
        OR: [{ userId: { in: userIds } }, { actorId: { in: userIds } }],
      },
    });
    await prisma.swap.deleteMany({ where: { id: { in: swapIds } } });
    await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
    await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
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
