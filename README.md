# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Deployment

```
yarn run start-test
```

## cache

cache use localforage library， key value get of getDbTableStoreName，see db.ts

```ts
localforage.setItem(
  getDbTableStoreName(DB_TABLES.masterEditions, masterKey),
  JSON.stringify(masterEditionAccountData),
);
```
