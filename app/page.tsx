"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/utils/firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";


type InventoryItem = {
  name: string;
  quantity: number;
};

export default function Home() {
  const words = `Inventory Tracker
`;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList: InventoryItem[] = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      } as InventoryItem);
    });
    setInventory(inventoryList);
  };

  const addItem = async (item: string) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item: string) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}

      <div className="absolute inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>



      <div className="relative z-20 w-full flex flex-col items-center gap-4 p-4">

  
      <TextGenerateEffect duration={3} filter={false} words={words} className="text-8xl font-spaceGrotesk"/>
   

        <Modal open={open} onClose={handleClose}>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black-200 border-2 rounded-lg border-white shadow-lg p-8">
            <Typography variant="h6" className="font-playfair">Add Item</Typography>
            <div className="flex flex-row gap-4 mt-4 text-white">
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="text-white font-playfair"
              />

              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
                className="text-white font-playfair"
              >
                Add
              </Button>

            </div>
          </div>
        </Modal>
        <div className="w-full max-w-3xl flex flex-col items-center gap-4">
          <TextField
            variant="outlined"
            fullWidth
            placeholder="🔍 Search for an item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full"
            inputProps={{ className: " bg-slate-800 text-white rounded-2xl font-playfair" }}
          />

        </div>
        <div className="w-full max-w-3xl border border-gray-800 bg-gray-transparent lg:h-[45vh] rounded-2xl m-4">
          <div className="flex items-center justify-center w-full h-24 bg-transparent rounded-lg">
            <Typography variant="h4" className="text-white font-playfair">
              INVENTORY ITEMS
            </Typography>
          </div>
          <div className="flex flex-col items-center w-full h-72 overflow-auto gap-4 p-4">
            {filteredInventory.map(({ name, quantity }) => (
              <div
                key={name}
                className="flex items-center justify-between w-full min-h-[120px] bg-slate-900 opacity-80 p-4 rounded-2xl shadow-md"
              >
                <Typography variant="h5" className="text-white text-center font-playfair">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h6" className="text-white text-center font-playfair">
                  {quantity}
                </Typography>
                <div className="flex flex-row gap-4">
                  <Button variant="outlined" onClick={() => addItem(name)} className="bg-green-600 text-white rounded-2xl">
                    Add
                  </Button>
                  <Button variant="outlined" onClick={() => removeItem(name)} className="bg-red-600 text-white rounded-2xl">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>
        <Button variant="outlined" onClick={handleOpen} className="m-4 text-lg text-green-300 border border-green-200 rounded-2xl">
            Add New Item
          </Button>
      </div>
    </div>
  );
}
