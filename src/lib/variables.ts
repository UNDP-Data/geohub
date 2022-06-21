import * as dotenv from 'dotenv'
dotenv.config()

export const AZURE_STORAGE_ACCOUNT: string = process.env.AZURE_STORAGE_ACCOUNT || ''
export const AZURE_STORAGE_ACCESS_KEY: string = process.env.AZURE_STORAGE_ACCESS_KEY || ''
export const AZURE_REDIS_HOSTNAME: string = process.env.AZURE_REDIS_HOSTNAME || ''
export const AZURE_REDIS_CACHEKEY: string = process.env.AZURE_REDIS_CACHEKEY || ''
