// ─── Enums ────────────────────────────────────────────────────────────────────

export type LifecycleStatus =
  | "planned"
  | "active"
  | "phaseOut"
  | "deprecated"
  | "archived";

export type DeploymentType = "SaaS" | "OnPrem" | "CloudHosted";

export type BusinessCriticality =
  | "missionCritical"
  | "businessCritical"
  | "standard"
  | "low";

export type CapabilityLevel = "L1" | "L2" | "L3";

export type TechnologyType =
  | "database"
  | "middleware"
  | "runtime"
  | "network"
  | "cloudService";

export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export type RegulatoryFlag = "GDPR" | "SAMA" | "PDPL" | "FRA" | "other";

export type IntegrationPattern = "API" | "ETL" | "event" | "file";

export type IntegrationProtocol = "REST" | "SOAP" | "Kafka" | "SFTP" | "other";

export type EntityType =
  | "BusinessCapability"
  | "Application"
  | "TechnologyComponent"
  | "DataObject"
  | "Integration";

// ─── Models ───────────────────────────────────────────────────────────────────

export interface BusinessCapability {
  id: string;
  name: string;
  description: string | null;
  level: CapabilityLevel;
  owner: string | null;
  entityScope: string[];
  lifecycleStatus: LifecycleStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

export interface Application {
  id: string;
  name: string;
  description: string | null;
  vendor: string | null;
  deploymentType: DeploymentType | null;
  businessCriticality: BusinessCriticality;
  lifecycleStatus: LifecycleStatus;
  hostingCountry: string | null;
  owner: string | null;
  contractRenewalDate: string | null;
  entityScope: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

export interface TechnologyComponent {
  id: string;
  name: string;
  type: TechnologyType | null;
  version: string | null;
  vendor: string | null;
  endOfLifeDate: string | null;
  lifecycleStatus: LifecycleStatus;
  owner: string | null;
  entityScope: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

export interface DataObject {
  id: string;
  name: string;
  description: string | null;
  classification: DataClassification;
  owningApplication: string | null;
  owningCapability: string | null;
  residencyCountry: string | null;
  regulatoryFlag: RegulatoryFlag | null;
  lifecycleStatus: LifecycleStatus;
  owner: string | null;
  entityScope: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

export interface Integration {
  id: string;
  name: string;
  sourceApplicationId: string | null;
  targetApplicationId: string | null;
  pattern: IntegrationPattern | null;
  protocol: IntegrationProtocol | null;
  dataClassification: DataClassification | null;
  owner: string | null;
  lifecycleStatus: LifecycleStatus;
  sla: string | null;
  entityScope: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
  sourceApplication?: Application | null;
  targetApplication?: Application | null;
}

export interface Relationship {
  id: string;
  sourceType: EntityType;
  targetType: EntityType;
  relationshipLabel: string | null;
  createdAt: string;
  sourceBusinessCapabilityId: string | null;
  sourceApplicationId: string | null;
  sourceTechnologyComponentId: string | null;
  sourceDataObjectId: string | null;
  sourceIntegrationId: string | null;
  targetBusinessCapabilityId: string | null;
  targetApplicationId: string | null;
  targetTechnologyComponentId: string | null;
  targetDataObjectId: string | null;
  targetIntegrationId: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
