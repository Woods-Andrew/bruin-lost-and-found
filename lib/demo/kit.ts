import type { ItemAttributes } from "@/lib/types";

export type DemoKitItem = {
  id: string;
  filename: string;
  photoUrl: string;
  title: string;
  description: string;
  location: string;
  attributes: ItemAttributes;
  searchQuery: string;
};

export const demoKit: DemoKitItem[] = [
  {
    id: "lime-jansport",
    filename: "lime-jansport.jpg",
    photoUrl: "/demo/lime-jansport.jpg",
    title: "Lime Jansport mini backpack",
    description:
      "Lime green Jansport mini backpack with a yellow rubber duck zipper pull, a GO BRUINS strip of duct tape on the bottom, and a Bruin bear pin. Found on a table at Powell Library.",
    location: "Powell Library",
    attributes: {
      category: "bag",
      color: "lime green",
      brand: "Jansport",
      material: "nylon",
      distinctiveMarks: "rubber duck zipper pull, GO BRUINS duct tape",
    },
    searchQuery: "lime jansport backpack with a rubber duck zipper and GO BRUINS tape",
  },
  {
    id: "switch-case",
    filename: "switch-case.jpg",
    photoUrl: "/demo/switch-case.jpg",
    title: "Red Switch case with daisy charm",
    description:
      "Red Nintendo Switch carrying case with a faded Kerckhoff stamp, a blue daisy zipper charm, and a peeling name tape that says Maya. Left in Kerckhoff Coffee House.",
    location: "Kerckhoff Coffee House",
    attributes: {
      category: "electronics",
      color: "red",
      brand: "Nintendo",
      material: "nylon",
      distinctiveMarks: "Kerckhoff stamp, blue daisy charm, Maya name tape",
    },
    searchQuery: "red nintendo switch case with a daisy charm and Kerckhoff stamp",
  },
  {
    id: "cs31-pencils",
    filename: "cs31-pencils.jpg",
    photoUrl: "/demo/cs31-pencils.jpg",
    title: "Clear pencil case with CS 31 note",
    description:
      "Transparent zip pencil case holding a gold mechanical pencil and a yellow sticky note that says CS 31 MIDTERM, with a purple unicorn charm. Found in Boelter Hall.",
    location: "Boelter Hall",
    attributes: {
      category: "school supplies",
      color: "clear",
      brand: "unknown",
      material: "plastic",
      distinctiveMarks: "CS 31 MIDTERM sticky note, purple unicorn charm",
    },
    searchQuery: "clear pencil case with a CS 31 midterm sticky note and unicorn charm",
  },
];
