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

const isRasterExtension = (name:string) => {
    let splitAt = name.lastIndexOf('.');
    let ext = name.slice(splitAt, name.length);
    let extensions = ['.tif', '.tiff', '.vrt', '.jpg', '.jpeg', '.img', '.nc' ];
    let v = extensions.includes(ext.toLowerCase());
    //console.log(name, ext, v);
    return v;

};

const listContainer = async (containerName:string, relPath:string) =>{

    
     // create storage container
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`, 
        sharedKeyCredential
    );


    let treeLabel:string = containerName;
    if (Boolean(relPath)){
        treeLabel = relPath;
    }
    let treePath = `${containerName}/${relPath}`

    if(treeLabel.endsWith('/')){treeLabel = treeLabel.slice(0,-1)}; 

    if (treeLabel.includes('/')){
          
        treeLabel = treeLabel.split('/').pop();
    }

    // else{
    //     childLabel = label;
    // }
    
    let tree = {'label':treeLabel, 'children':[], 'path':treePath, 'url':null};
    let cclient = blobServiceClient.getContainerClient(containerName);
    let containerChildren = []; 
    //console.log('listing container',containerName, relPath, 'labelPath', labelPath );
    for await (const item of cclient.listBlobsByHierarchy('/', {'prefix':relPath}  )) {
        let childLabel;
        
        let path = `${containerName}/${item.name}`
        if (item.kind === "prefix") {

            let label = item.name.slice(0, -1);
            if (label.includes('/')){
            
                childLabel = label.split('/').pop();
            }
    
            else{
                childLabel = label;
            }


            containerChildren.push({'label':childLabel, 'children':[], 'path':path, 'url':null})

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
            if (label.includes('/')){
            
                childLabel = label.split('/').pop();
            }
    
            else{
                childLabel = label;
            }
            

            if (childLabel == 'metadata.json'){
                let splitAt = blobServiceClient.url.lastIndexOf('/');

                
                const rurl = `${blockBlobClient.url.replace('metadata.json', '{z}/{x}/{y}.pbf')}?${sasToken}`;

                tree.url = rurl

            }
            
            let israster = isRasterExtension(childLabel);
            
            containerChildren.push({'label':childLabel, 'path':path, 'url':sasUrl, 'isRaster': israster })
        }
        

    }
    tree.children = containerChildren;

    return {
        tree
    }

}


/*
    List containers from GeoHub Azure Storage account
        @param @type {string}
    
    */

const listContainers = async( prefix:string = '/' ) => {
    
     


    // create storage container
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`, 
        sharedKeyCredential
    );
    
    let tree = {'label':'GeoHub Azure Storage', 'children':[], 'path':prefix, 'url':null};
    
    
    for await (const container of blobServiceClient.listContainers()) {
        let containerItem = {'label':container.name, 'children':[], 'path':`${container.name}/`, 'url':null}
        tree.children.push(containerItem);        
        
    }

    return{    
        tree
    }
};

export async function get( query) {
    
    
    let  path = '/';
    if (query.url.searchParams.has('path')){
        path = query.url.searchParams.get('path');
        if (! path.endsWith('/')){
            path = `${path}/`
        }

        
    } 
    // let 
    let tree  = undefined;
    if (path == '/' ){
       
       tree = await listContainers();
    }
    else {
        let containerName, containerPath;
        

        [containerName, ...containerPath]  = path.split('/'); 
        
        if (Array.isArray(containerPath) && containerPath.length && containerPath[0] != "" ){
            containerPath = `${containerPath.join('/')}`;
        }
        else {
            containerPath = '';
        }
        
        

        tree = await listContainer(containerName, containerPath);
    }
    
        
    
    
    return {
        
        body: tree
  };
}


