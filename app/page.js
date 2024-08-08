"use client";

import { useState, useEffect } from "react";
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

// Add this animation style for the heading
const headingStyle = {
  color: '#1a1a1a', // Dark color
  textShadow: '1px 1px 2px #000, 0 0 25px #333, 0 0 5px #000',
  animation: 'float 3s ease-in-out infinite',
  transformStyle: 'preserve-3d',
  perspective: '500px',
};

const floatAnimation = `
@keyframes float {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: rotateX(10deg) rotateY(10deg);
  }
  100% {
    transform: rotateX(0deg) rotateY(0deg);
  }
}
`;

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [threshold, setThreshold] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ id: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
    // Add the animation keyframes to the document's stylesheet
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(floatAnimation, styleSheet.cssRules.length);
  }, []);

  const addItem = async () => {
    const docRef = doc(firestore, "inventory", itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, {
        quantity: quantity + 1,
        category: itemCategory,
        expiryDate,
        threshold
      });
    } else {
      await setDoc(docRef, {
        quantity: 1,
        category: itemCategory,
        expiryDate,
        threshold
      });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    if (!item || !item.id) {
      console.error("Invalid item:", item);
      return;
    }
    
    const docRef = doc(firestore, "inventory", item.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const filteredInventory = inventory.filter(({ id, category }) =>
    (id && id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (category && category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      className="relative min-h-screen flex flex-col items-center gap-4 p-6 bg-cover bg-center"
      style={{ backgroundImage: `url('https://img.freepik.com/premium-photo/there-is-shelf-with-jars-food-bag-food-generative-ai_1034043-1106.jpg?w=1060')`, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* Overlay for Background Opacity */}
      <Box className="absolute inset-0 bg-black opacity-50"></Box>

      {/* Content Wrapper */}
      <Box className="relative z-10 flex flex-col items-center gap-4 p-6">
        {/* Heading */}
        <Typography
          variant="h1"
          className="text-4xl font-bold text-white mb-6 mt-4 font-['Roboto'] shadow-lg"
          sx={headingStyle}
        >
          Welcome to The Pantry Genie
        </Typography>

        {/* Search Bar */}
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          margin="normal"
          className="bg-white shadow-md"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>

        {/* Modal for Adding Items */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <Typography variant="h6">Add Item</Typography>
            <Stack spacing={2}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                select
                label="Category"
                variant="outlined"
                fullWidth
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Meat">Meat</MenuItem>
                <MenuItem value="Snacks">Snacks</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
              </TextField>
              <TextField
                label="Expiry Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <TextField
                label="Low Stock Threshold"
                type="number"
                variant="outlined"
                fullWidth
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem();
                  setItemName("");
                  setItemCategory("");
                  setExpiryDate("");
                  setThreshold(1);
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Inventory List */}
        <Box className="w-full max-w-2xl border border-gray-300 shadow-lg bg-white rounded-lg overflow-hidden">
          <Box className="bg-blue-200 p-4">
            <Typography variant="h4" className="text-center text-gray-800">Inventory Items</Typography>
          </Box>
          <Stack spacing={2} className="p-4 max-h-96 overflow-auto">
            {filteredInventory.map((item) => (
              <Box
                key={item.id}
                className={`flex justify-between items-center p-4 rounded-md shadow-sm ${
                  item.quantity <= item.threshold ? "bg-red-100" : "bg-gray-50"
                }`}
              >
                <Typography variant="h6" className="text-gray-700">
                  {item.id.charAt(0).toUpperCase() + item.id.slice(1)} ({item.category})
                </Typography>
                <Typography variant="h6" className="text-gray-700">
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="h6" className="text-gray-700">
                  Expiry: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => removeItem(item)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
