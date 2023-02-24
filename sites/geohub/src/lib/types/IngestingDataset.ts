export interface RawDataset {
  name: string
  url: string
  contentLength: number
  createdat: string
  updatedat: string
  error?: string
}
export interface IngestedDataset {
  name?: string
  url?: string
  contentLength?: number
  createdat?: string
  updatedat?: string
  processing?: boolean
}

export interface IngestingDataset {
  raw: RawDataset
  datasets?: IngestedDataset[]
}
