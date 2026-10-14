import { mockEmbed, itemText } from "@/lib/ai/matching";
import type { Item, Profile } from "@/lib/types";

export const DEMO_STUDENT_ID = "demo-student";
export const DEMO_STAFF_ID = "demo-staff";

export const demoProfiles: Profile[] = [
  {
    id: DEMO_STUDENT_ID,
    email: "bruin@ucla.edu",
    name: "Alex Bruin",
    role: "student",
    emailVerified: true,
  },
  {
    id: DEMO_STAFF_ID,
    email: "staff@ucla.edu",
    name: "Lost & Found Desk",
    role: "staff",
    emailVerified: true,
  },
];

function seededItem(
  partial: Omit<Item, "embedding" | "status" | "aiSource" | "updatedAt"> & {
    createdAt: string;
  },
): Item {
  const item: Item = {
    ...partial,
    status: "published",
    aiSource: "mock",
    embedding: null,
    updatedAt: partial.createdAt,
  };
  item.embedding = mockEmbed(itemText(item));
  return item;
}

export const demoItems: Item[] = [
  seededItem({
    id: "seed-backpack",
    kind: "found",
    title: "Navy North Face backpack",
    description:
      "Navy blue North Face Borealis backpack with a gold UCLA keychain on the zipper and a water-bottle pocket. Found on a table at Powell Library.",
    attributes: {
      category: "bag",
      color: "navy blue",
      brand: "North Face",
      material: "nylon",
      distinctiveMarks: "gold UCLA keychain on zipper",
    },
    location: "Powell Library",
    photoUrl: "/seed/backpack.svg",
    reporterId: DEMO_STAFF_ID,
    createdAt: "2026-10-10T16:00:00.000Z",
  }),
  seededItem({
    id: "seed-bottle",
    kind: "found",
    title: "Gold Hydro Flask water bottle",
    description:
      "32 oz gold Hydro Flask with a ring of stickers, including a Bruin bear. Left near the microwave in Ackerman Union.",
    attributes: {
      category: "bottle",
      color: "gold",
      brand: "Hydro Flask",
      material: "stainless steel",
      distinctiveMarks: "Bruin bear sticker near the base",
    },
    location: "Ackerman Union",
    photoUrl: "/seed/bottle.svg",
    reporterId: DEMO_STAFF_ID,
    createdAt: "2026-10-11T18:30:00.000Z",
  }),
  seededItem({
    id: "seed-phone",
    kind: "found",
    title: "iPhone with Bruins case",
    description:
      "Black iPhone 15 in a blue-and-gold UCLA Bruins silicone case. Lock screen shows a hiking photo. Found courtside at the John Wooden Center.",
    attributes: {
      category: "electronics",
      color: "black and gold",
      brand: "Apple",
      material: "silicone case",
      distinctiveMarks: "UCLA Bruins case, hiking lock screen",
    },
    location: "John Wooden Center",
    photoUrl: "/seed/phone.svg",
    reporterId: DEMO_STUDENT_ID,
    createdAt: "2026-10-12T21:15:00.000Z",
  }),
  seededItem({
    id: "seed-hoodie",
    kind: "lost",
    title: "Maroon UCLA hoodie",
    description:
      "Oversized maroon Champion hoodie with UCLA lettering. Left in a lecture hall at Royce Hall after discussion section.",
    attributes: {
      category: "clothing",
      color: "maroon",
      brand: "Champion",
      material: "cotton",
      distinctiveMarks: "small bleach spot on the front pocket",
    },
    location: "Royce Hall",
    photoUrl: "/seed/hoodie.svg",
    reporterId: DEMO_STUDENT_ID,
    createdAt: "2026-10-09T15:10:00.000Z",
  }),
  seededItem({
    id: "seed-airpods",
    kind: "found",
    title: "AirPods case with Bruin charm",
    description:
      "White AirPods Pro charging case with a tiny gold bear charm on the ring. Found under a chair in Kerckhoff Coffee House.",
    attributes: {
      category: "electronics",
      color: "white and gold",
      brand: "Apple",
      material: "plastic",
      distinctiveMarks: "gold bear charm on the case ring",
    },
    location: "Kerckhoff Coffee House",
    photoUrl: "/seed/airpods.svg",
    reporterId: DEMO_STAFF_ID,
    createdAt: "2026-10-13T14:05:00.000Z",
  }),
];
