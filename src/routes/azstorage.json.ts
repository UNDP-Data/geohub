import { 
    BlobServiceClient, 
    StorageSharedKeyCredential, 
    generateBlobSASQueryParameters,
    BlobSASPermissions, 
    ContainerClient}
 from "@azure/storage-blob"
// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();





//set creds
const account = process.env.AZURE_STORAGE_ACCOUNT || "";
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY || "";
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);



const x = "something";

interface TreeNode {
    label: string;
    children?: TreeNode[];
    new(label:string): TreeNode;
  }
  
interface ITree<P> {
    label: P;
    children?: ITree<P>[];
  }
  

export const get1 = () => {
    return{
        body:{
            x:x
        },
    }
};



const listContainer = async (containerName:string, prefix:string) =>{
     // create storage container
     const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`, 
        sharedKeyCredential
    );
    let tree = {'label':containerName.slice(0,-1), 'children':[], 'path':containerName, 'url':null};
    let cclient = blobServiceClient.getContainerClient(containerName);
    let containerChildren = []; 
    for await (const item of cclient.listBlobsByHierarchy("/", )) {
    
        let path = `${containerName}${item.name}`
        if (item.kind === "prefix") {
            let label = item.name.slice(0, -1)
            

            // console.log(`\t${label}`);
            let treeItem = {'label':label, 'children':[], 'path':path}
            containerChildren.push(treeItem)
        } else {
            const blockBlobClient = cclient.getBlockBlobClient(item.name);
            const sasToken = generateBlobSASQueryParameters({
                containerName: containerName,
                blobName: item.name,
                expiresOn: new Date(new Date().valueOf() + 86400),
                permissions: BlobSASPermissions.parse("r")
            }, sharedKeyCredential);
            
            const sasUrl = `${blockBlobClient.url}?${sasToken}`;
            let label = item.name;
            // console.log(`\t${label}`);
            
            containerChildren.push({'label':label, 'path':sasUrl})
        }
        

    }
    tree.children = containerChildren;

    return {
        tree
    }

}

const listContainers = async( prefix:string = '/' ) => {



    // create storage container
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`, 
        sharedKeyCredential
    );
    
    let tree = {'label':'GeoHub Azure Storage', 'children':[], 'path':prefix, 'url':null};
    
    console.log(`Containers at ${prefix}:`);
    for await (const container of blobServiceClient.listContainers()) {
        console.log(`- ${container.name}`);
        let containerItem = {'label':container.name, 'children':[], 'path':`${container.name}/`, 'url':null}
        tree.children.push(containerItem);
        
        
        
    }

    console.log(tree);

    return{    
        tree
    }
};

export async function get( query) {
    console.log(query.url);
    let  prefix = '/';
    if (query.url.searchParams.has('prefix')){
        prefix = query.url.searchParams.get('prefix');
        
    } 
    let tree = await listContainers(prefix);
    
    if (prefix != '/' ){
        tree = await listContainer(prefix, prefix)
    }
    
        
    
    
    return {
        
        body: tree
  };
}


