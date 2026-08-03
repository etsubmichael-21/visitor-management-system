export type RouteType = 'DirectEmployee' | 'Reception';

export interface VisitorRoutingDecision {
  isConfidential: boolean;
  knowsEmployee: boolean;
  routeType: RouteType;
}
