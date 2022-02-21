import { BlobServiceClient, ContainerClient } from "@azure/storage-blob"
import { containers } from "../containers"
import { ACCOUNT_NAME, CONTAINER_NAME, SAS_TOKEN } from '$lib/env'


// Generate these
const account_url = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}`
const blob_url = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${SAS_TOKEN}&comp=list&restype=container`



// Start here: 12/Feb/2022
// Note 1: There is the need to have a defined Folder Structure
// Note 2: Need to write specific code that searches for (/) in a string and splits the strings based on this
// and adds nodes to a tree as the data appears on the folder

const containerClient : ContainerClient = new ContainerClient(blob_url)

// Create an Array for which each of the urls will be placed
let blobsArray = [];

let tree = {
    label: "testforgeohub", children: [
    ],
}

export async function get() {
    let i = 1
    for await (const blob of containerClient.listBlobsByHierarchy("/HREA_Algeria_2012_v1/")) {

        tree.children.push(
            {
                label:`${blob.name}`,
                url:`https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blob.name}`
            }
            )

        console.log(`Blob ${i++}: ${blob.name}`);
    }
    return {
        body:tree
    }
}
