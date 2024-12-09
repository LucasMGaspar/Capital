"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserSettingsSchema } from "@/schemas/auth";
import { findUserbyId } from "@/services";
import bcryptjs from "bcryptjs";
import type { z } from "zod";

/**
 * This method saves the user's new settings
 * @param {z.infer<typeof UserSettingsSchema>} settings - The new user data.
 * @returns {Promise<{error?: string, success?: string, user?: User}>} The result of the settings change request.
 */
export const changeSettings = async (settings: z.infer<typeof UserSettingsSchema>) => {
  const validData = UserSettingsSchema.safeParse(settings);
  if (!validData.success) {
    return {
      error: "Invalid data",
    };
  }

  const session = await auth();
  if (!session?.user || !session?.user.id) {
    return {
      error: "Connect to update your data",
    };
  }

  const userData = await findUserbyId(session?.user.id);
  if (!userData) {
    return {
      error: "User not found",
    };
  }

  const { password, newPassword } = validData.data;
  if (password && newPassword && userData?.password) {
    const validPassword = await bcryptjs.compare(password, userData.password);
    if (!validPassword) {
      return {
        error: "Incorrect current password",
      };
    }

    settings.newPassword = undefined;
    settings.password = await bcryptjs.hash(newPassword, 10);
  }
  settings.email = undefined;

  try {
    const { newPasswordConfirmed, ...settingsWithoutNewPasswordConfirmed } = settings;

    const updatedUser = await prisma.user.update({
      data: {
        ...settingsWithoutNewPasswordConfirmed,
      },
      where: {
        id: userData.id,
      },
    });

    return {
      success: "Updated profile",
      user: updatedUser,  // Retorna os dados atualizados do usuário na resposta
    };
  } catch (error) {
    return {
      error: "Something went wrong",
    };
  }
};
