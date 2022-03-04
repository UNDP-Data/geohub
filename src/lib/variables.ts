import * as dotenv from "dotenv";
dotenv.config();

export const AZURE_STORAGE_ACCOUNT: string = process.env.AZURE_STORAGE_ACCOUNT || "";
export const AZURE_STORAGE_ACCESS_KEY: string = process.env.AZURE_STORAGE_ACCESS_KEY || "";