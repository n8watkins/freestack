export type Facets = {
  storageGb?: number;
  requestsPerMonth?: number;
  seats?: number;
  projects?: number;
  bandwidthGb?: number;
  buildMinutes?: number;
  openSource?: boolean;
  noCreditCard?: boolean;
  unlimited?: string[];
};

export type Service = {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  description: string;
  freeTierNotes: string;
  logo: string;
  facets: Facets;
};

export type Category = {
  name: string;
  count: number;
  id: string;
};

export type ServicesData = {
  generatedAt: string;
  source: string;
  count: number;
  categories: Category[];
  services: Service[];
};
