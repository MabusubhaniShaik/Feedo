// app/api/auth/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import UserAuthToken from "@/models/auth.model";
import { connectDB } from "@/lib/db";

await connectDB();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, user_id, password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!email && !user_id) {
      return NextResponse.json(
        { error: "Email or user_id is required" },
        { status: 400 }
      );
    }

    let user;

    if (email) {
      user = await User.findOne({ email });
    } else if (user_id) {
      user = await User.findOne({ user_id });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userData = await User.findById(user._id).select("-password").lean();

    const accessToken = jwt.sign(
      {
        user: userData,
        user_id: user._id.toString(),
        email: user.email,
        role: user.role_name,
        role_id: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        user_id: user._id.toString(),
      },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }
    );

    const expiredTime = new Date();
    expiredTime.setHours(expiredTime.getHours() + 1);

    await UserAuthToken.create({
      user_id: user._id.toString(),
      user_name: user.name,
      access_token: accessToken,
      refresh_token: refreshToken,
      expired_time: expiredTime,
      login_time: new Date(),
      created_by: user.name,
      updated_by: user.name,
    });

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
