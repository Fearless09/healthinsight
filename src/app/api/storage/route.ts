import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const AWS_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const bucket = formData.get("bucket") as string;

    if (!(file instanceof File) || !title) {
      console.warn("Invalid payload");
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
      });
    }
    if (!AWS_ENDPOINT) {
      return new Response(JSON.stringify({ error: "S3 endpoint not found" }), {
        status: 400,
      });
    }

    const files = new Files({ adapter: neon({ bucket: "avatar" }) });
    const { key } = await files.upload(title, file);
    const url = `${AWS_ENDPOINT}/${bucket}/${key}`;

    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error("Failed to upload file", error);
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = (await request.json()) as { url: string };
    if (!url.trim()) {
      return new Response(JSON.stringify("URL not provided"));
    }
    const urlArr = url.split("/");
    const bucket = urlArr[urlArr.length - 2];
    const key = urlArr[urlArr.length - 1];

    const files = new Files({ adapter: neon({ bucket }) });
    await files.delete(key);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Failed to delete file", error);
    return new Response(JSON.stringify({ error: "Failed to delete file" }), {
      status: 500,
    });
  }
}
