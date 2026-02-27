import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import suppliersReducer from './slices/suppliersSlice';
import clientsReducer from './slices/clientsSlice';
import rawMaterialsReducer from './slices/rawMaterialsSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';
import boxMasterReducer from './slices/boxMasterSlice';
import costingReducer from './slices/costingSlice';
import stockMovementsReducer from './slices/stockMovementsSlice';
import ratesReducer from './slices/ratesSlice';
import calculationReducer from './slices/calculationSlice';
import quotationManagementReducer from './slices/quotationManagementSlice';
import salesOrdersReducer from './slices/salesOrderSlice';
import godownJobWorkerReducer from './slices/godownJobWorkerSlice';
import purchaseInwardReducer from './slices/purchaseInwardSlice';
import jobCardReducer from './slices/jobCardSlice';

const rootReducer = combineReducers({
  suppliers: suppliersReducer,
  clients: clientsReducer,
  rawMaterials: rawMaterialsReducer,
  purchaseOrders: purchaseOrdersReducer,
  boxMaster: boxMasterReducer,
  costing: costingReducer,
  stockMovements: stockMovementsReducer,
  rates: ratesReducer,
  calculations: calculationReducer,
  quotationManagement: quotationManagementReducer,
  salesOrders: salesOrdersReducer,
  godownJobWorker: godownJobWorkerReducer,
  purchaseInward: purchaseInwardReducer,
  jobCards: jobCardReducer,
});

const persistConfig = {
  key: 'boxManufacturing',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;