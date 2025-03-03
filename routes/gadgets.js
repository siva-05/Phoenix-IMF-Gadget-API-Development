const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Gadget = require('../models/Gadget');
const authenticateUser = require('../middleware/auth')

const router = express.Router();



// Random codename generator
const randomCodenames = new Set(["The Nightingale", "The Kraken", "The Phantom", "The Shadow", "The Ghost", "The Falcon", "The Cobra", "The Specter", "The Viper", "The Mirage"]);

const getRandomCodename = () => {
  const codenamesArray = Array.from(randomCodenames);
  const randomIndex = Math.floor(Math.random() * codenamesArray.length);
  const selectedCodename = codenamesArray[randomIndex];
  randomCodenames.delete(selectedCodename);
  
  if (randomCodenames.size === 0) {
    // If all codenames have been used, reset the set
    randomCodenames.clear();
    ["The Nightingale", "The Kraken", "The Phantom", "The Shadow", "The Ghost", "The Falcon", "The Cobra", "The Specter", "The Viper", "The Mirage"].forEach(codename => randomCodenames.add(codename));
  }
  
  return selectedCodename;
};


// Random mission success probability
const getMissionProbability = () => `${Math.floor(Math.random() * 100)}% success probability`;

// GET - Get all gadgets
router.get('/', async (req, res) => {
  try {
    let gadgets;
    if (req.query.status) {
      gadgets = await Gadget.findAll({ where: { status: req.query.status } });
    } else {
      gadgets = await Gadget.findAll();
    }
    const gadgetsWithProbability = gadgets.map(gadget => ({
      ...gadget.toJSON(),
      missionProbability: getMissionProbability()
    }));
    res.json(gadgetsWithProbability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add a new gadget
router.post('/', authenticateUser, async (req, res) => {
  try {
    const newGadget = await Gadget.create({
      id: uuidv4(),
      name: getRandomCodename(),
      status: 'Available',
    });
    res.status(201).json(newGadget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Update a gadget info
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { status } = req.body;
    const gadget = await Gadget.findByPk(req.params.id);
    if (!gadget) return res.status(404).json({ error: "Gadget not found" });

    // we can't able to decommission or destroy a gadget using update method
    // decommissioning or destroying a gadget requires a different method
    if (status=="Decommissioned" || status=="Destroyed") {
      return res.status(403).json({ error: `Changing the status to ${status} is not allowed. Decommissioning or destroying a gadget requires a different method.`})
    }

    // we can't change the status if it's already decommissioned or destroyed
    if ( gadget.status=="Decommissioned" || gadget.status=="Destroyed") {
      return res.status(403).json({ currentStatus: gadget.status, error: `The gadget is already ${gadget.status} and cannot be modified further`})
    }

    // If the gadget is already in the requested status
    if (gadget.status == status) return res.status(200).json({message: "Gadget is already "+status})


    gadget.status = status || gadget.status;
    await gadget.save();
    res.json(gadget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove a gadget 
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const gadget = await Gadget.findByPk(req.params.id);
    if (!gadget) return res.status(404).json({ error: "Gadget not found" });
    if (gadget.status == 'Destroyed') return res.status(200).json({message: "Gadget is already Destroyed. Decommissioning is not possible"})
    if (gadget.status == 'Decommissioned') return res.status(200).json({message: "Gadget is already Decommissioned"})
    gadget.status = 'Decommissioned';
    gadget.decommissionedAt = new Date();
    await gadget.save();
    res.json({ message: "Gadget decommissioned", gadget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Self-Destruct - Destroy a gadget
router.post('/:id/self-destruct', async (req, res) => {
  try {
    const gadget = await Gadget.findByPk(req.params.id);
    if (!gadget) return res.status(404).json({ error: "Gadget not found" });
    if (gadget.status == 'Destroyed') return res.status(200).json({message: "Gadget is already Destroyed"})

    const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ message: `Self-destruct sequence initiated for ${gadget.name}. Confirmation Code: ${confirmationCode}` });


    setTimeout(async () => {
      gadget.status = 'Destroyed';
      await gadget.save();
      console.log(`${gadget.name} has been destroyed.`);
    }, 5000);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
