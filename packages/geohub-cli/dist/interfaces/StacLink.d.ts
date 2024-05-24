export interface StacLink {
    rel: string;
    type: string;
    href: string;
    method?: string;
    body?: {
        [key: string]: string;
    };
}
