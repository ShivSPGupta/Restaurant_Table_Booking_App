export type RestaurantTable = {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
};

export type TableRequest = {
  name?: string;
  capacity?: number | string;
  isActive?: boolean;
};

export type TableRepository = {
  findByRestaurantId: (
    restaurantId: string
  ) => Promise<RestaurantTable[]> | RestaurantTable[];
  create: (
    table: RestaurantTable
  ) => Promise<RestaurantTable> | RestaurantTable;
  update: (
    restaurantId: string,
    tableId: string,
    updates: Partial<Pick<RestaurantTable, "name" | "capacity" | "isActive">>
  ) => Promise<RestaurantTable | null | undefined> | RestaurantTable | null | undefined;
};
