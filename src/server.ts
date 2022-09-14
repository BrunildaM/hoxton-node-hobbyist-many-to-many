import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const port = 4000;

// USERS

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { hobbies: true } });
  res.send(users);
});

app.post("/createUser", async (req, res) => {
  const newUserData = {
    fullName: req.body.fullName,
    photoUrl: req.body.photoUrl,
    email: req.body.email,
    hobbies: req.body.hobbies ? req.body.hobbies : [],
  };

  const newUser = await prisma.user.create({
    data: {
      fullName: newUserData.fullName,
      photoUrl: newUserData.photoUrl,
      email: newUserData.email,
      hobbies: {
        connectOrCreate: newUserData.hobbies.map((hobby: string) => ({
          where: { name: hobby },
          create: { name: hobby },
        })),
      },
    },
    include: { hobbies: true },
  });
  res.send(newUser);
});

app.patch("/hobbies/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updatedHobby = await prisma.hobby.update({
    data: req.body,
    where: { id },
    include: { users: true },
  });
  res.send(updatedHobby);
});

app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.user.delete({ where: { id } });
  res.send({ message: "User deleted successfully" });
});

app.patch("/addHobbyToUser", async (req, res) => {
  const userEmail = req.body.userEmail;
  const hobbyId = Number(req.body.hobbyId);

  const user = await prisma.user.update({
    where: { email: userEmail },
    data: {
      hobbies: {
        connectOrCreate: {
          where: { id: hobbyId },
          create: { name: req.body.name, active: req.body.active },
        },
      },
    },
    include: {
      hobbies: true,
    },
  });

  res.send(user);
});

// HOBBIES

app.get("/hobbies", async (req, res) => {
  const hobbies = await prisma.hobby.findMany({ include: { users: true } });
  res.send(hobbies);
});

app.post("/createHobbies", async (req, res) => {
  const newHobbyData = {
    name: req.body.name,
    imageUrl: req.body.imageUrl,
    active: req.body.active,
    users: req.body.users ? req.body.users : [],
  };

  const newHobby = await prisma.hobby.create({
    data: {
      name: newHobbyData.name,
      imageUrl: newHobbyData.imageUrl,
      active: newHobbyData.active,
      users: {
        connectOrCreate: newHobbyData.users.map((user: string) => ({
          where: { email: user },
          create: { email: user },
        })),
      },
    },
    include: { users: true },
  });
  res.send(newHobby);
});

app.patch("/users/:id", async (req, resp) => {
  const id = Number(req.params.id);
  const updatedUser = await prisma.user.update({
    data: req.body,
    where: { id },
    include: { hobbies: true },
  });
  resp.send(updatedUser);
});

app.delete("/hobbies/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.hobby.delete({ where: { id } });
  res.send({ message: "Hobby deleted successfully" });
});

app.patch("/addUserToHobby", async (req, res) => {
  const hobbyId = Number(req.body.hobbyId);
  const userEmail = req.body.userEmail;

  const hobby = await prisma.hobby.update({
    where: { id: hobbyId },
    data: {
      users: {
        connectOrCreate: {
          where: { email: userEmail },
          create: { email: req.body.email, fullName: req.body.fullName },
        },
      },
    },
    include: {
      users: true,
    },
  });

  res.send(hobby);
});

app.listen(port, () => {
  console.log(`Click this: http://localhost:${port}`);
});
