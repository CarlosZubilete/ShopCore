import { Router, Response, Request } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { User } from "./user.types";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userRouter = Router();

userRouter.post("/", async (req: Request, res: Response) => {
  const userData: User = req.body;
  console.log("Creating user with data:", userData);
  try {
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
userRouter.get("/", async (_: Request, res: Response) => {
  try {
    const users: User[] = await userService.findUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
userRouter.get("/:id", async (req: Request, res: Response) => {
  const userId: string = req.params.id as string;
  try {
    const user: User | null = await userService.findUserById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user by ID
userRouter.put("/:id", async (req: Request, res: Response) => {
  const userId: string = req.params.id as string;
  const updateData: Partial<User> = req.body;
  try {
    const updatedUser = await userService.updateUser(userId, updateData);
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user by ID
userRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId: string = req.params.id as string;
  try {
    const deleted = await userService.deleteUser(userId);
    if (deleted) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default userRouter;

// export default () => {
// Create a new user
// userRouter.post("/", async (req: Request, res: Response) => {
//   const userData: User = req.body;
//   console.log("Creating user with data:", userData);
//   try {
//     const newUser = await userService.createUser(userData);
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create user" });
//   }
// });

// // Get all users
// userRouter.get("/", async (_: Request, res: Response) => {
//   try {
//     const users: User[] = await userService.findUsers();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// });

// // Get user by ID
// userRouter.get("/:id", async (req: Request, res: Response) => {
//   const userId: string = req.params.id as string;
//   try {
//     const user: User | null = await userService.findUserById(userId);
//     if (user) {
//       res.status(200).json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// // Update user by ID
// userRouter.put("/:id", async (req: Request, res: Response) => {
//   const userId: string = req.params.id as string;
//   const updateData: Partial<User> = req.body;
//   try {
//     const updatedUser = await userService.updateUser(userId, updateData);
//     if (updatedUser) {
//       res.status(200).json(updatedUser);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update user" });
//   }
// });

// // Delete user by ID
// userRouter.delete("/:id", async (req: Request, res: Response) => {
//   const userId: string = req.params.id as string;
//   try {
//     const deleted = await userService.deleteUser(userId);
//     if (deleted) {
//       res.status(200).json({ message: "User deleted successfully" });
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// });

// return userRouter;
// };
