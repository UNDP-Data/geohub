import { PoolClient } from 'pg';
import { Tag } from '../interfaces';
declare class Tags {
    private tags;
    getTags(): Tag[];
    setTags(tags: Tag[]): void;
    constructor(tags: Tag[]);
    add(tag: Tag): void;
    insert(client: PoolClient): Promise<Tag[]>;
    private load;
    cleanup(client: PoolClient): Promise<void>;
}
export default Tags;
