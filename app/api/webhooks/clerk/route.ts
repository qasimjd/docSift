import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser, deleteUser, updateUser } from "@/actions/user.action";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET || "";
  if (!SIGNING_SECRET) {
    throw new Error("❌ SIGNING_SECRET is missing from environment variables.");
  }

  try {
    Buffer.from(SIGNING_SECRET, "base64").toString("utf-8");
  } catch (error) {
    console.error("❌ Error: SIGNING_SECRET is not a valid Base64 string.", error);
    return new Response("Server Error: Invalid SIGNING_SECRET", { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;
  const { id } = evt.data;

  try {
    if (eventType === "user.created") {
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;
      const user = {
        clerkId: id!,
        email: email_addresses?.[0]?.email_address ?? "",
        username: username ?? "",
        fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        photo: image_url ?? "",
      };
      const newUser = await createUser(user);
      return NextResponse.json({ message: "User created", user: newUser });
    }

    if (eventType === "user.updated") {
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;
      const user = {
        clerkId: id!,
        email: email_addresses?.[0]?.email_address ?? "",
        username: username ?? "",
        fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        photo: image_url ?? "",
      };
      const updatedUser = await updateUser(id!, user);
      return NextResponse.json({ message: "User updated", user: updatedUser });
    }

    if (eventType === "user.deleted") {
      const deletedUser = await deleteUser(id!);
      return NextResponse.json({ message: "User deleted", user: deletedUser });
    }
  } catch (error) {
    console.error(`❌ Error processing eventType:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  console.log(`Unhandled webhook event: eventType`, body);
  return NextResponse.json({ message: "Event received but not processed" }, { status: 200 });
}