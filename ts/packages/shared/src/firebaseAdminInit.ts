import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = { // ATTENTION: hardcoded
  projectId: "toolproof-563fe",
  privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5GexR05rl0OWq\nI20v3PCvsXYfT6n4eRSx/kZAwqlhEDvpFDI5SJNjPSzAZhii009K0AGzxC42QN36\nEgpBZ7VEkRKp9jGJWJAdplCL3mxvH3nv9duBwpi89ApPubuG6vicSHndF0wpC3PM\nDeuKuYwhkTauIn36+S3PYLCZdGvmUtpmUjJbMYEJiV9qDJIdmnZbqoqY5sgT0vu3\nOUIlRkZrHZyQ9o0er4a7C81OYT0+zJifNqW4g4AxYnL99nBYKoSfVLTdTfw4bR8I\nShlGA3r+T16CQXCqhN81zkFdOpWWvEbudwy/8TEu8m1F6NKDr7rK3KFECScG1Dg5\n/ytovCyHAgMBAAECggEABmOEqpZZJFF/e83ZOOuxSv8fCpmfTjovoq0aE6YkXntG\n9haCXUPKAoTcBJABja0pcXWYeXHt/mViw/zXacaAlStEr6UVtJ3f64YQBaPZrkQx\n2zxrJSFoUC1EJdhNRqzZg9tkiWMCd/AzQPnCBXm+AnKWpo/+NSlgkWXO8pz4FGz8\noZv8R49bXYzbTRP5PxxaCZ1U9v/++mbXMF8DksInVXz7zDDfICAXRUluAmeBHJGN\nnsrJOc4NyXln5oXCZ1aSckPvjdAQAL3wdBVwoFua5Ltz1SwdAJmr2c5quhEfa+wh\nmrcXu3NLmI8Bz23cAzuMil1XBI9PJermRpTiWJRbUQKBgQDcbS4XHe9Kpj1DYmeJ\nspsuuexWW0gro1E3GqyqyFIwQa84BeMuAtK24PNEbTAMMqkdiG1cKDp1tOZC14wx\nm24QbDeXQb4bqMK/JRyyWfEqzBAaRNf4tQLU1fGqirTiohkFr+OdGUTzOJXCanhh\nHZMvAoLw/R3Zgpw9XwWUzLi33QKBgQDW+UwuwbatWC5ci+oIS5SKLppgHV6OllPd\nmVt63nSkWWGSW+tinhn+jNTvqRzgAaa90pwEAf5kZmTx6ZDYh6kDKDStJBfu9NmL\ny+AjCmBDB6eMmcSqzn/zzHqFHMgTtuUtAO4mtJcSvxCSlqqte+P8D6niw5mfxLj6\nAjpyAG7BswKBgCRyGPDRjkM1gWOm3Z+y3F25eA4/QYuVkVQfIPWL8arw8Vu9/XYa\nGWULhK2HsC4UIkozyIE4VZIouvnKUe/R1zz356kmwZwpJyobpMcIgAunefId9+ez\nZihyx2Z/ULE4RBLgpi3Pg8sDTB+9IvJLxY48SBI4h7rzEYpEL9QOlWwxAoGBAMdh\nOj4XXgVRxtYA0lNVPfQXGwjP1HYsiKX7aTQBBG+1kmA7LootlnBXT9rjnytHfM2L\nezXgX3/g0/jmJngdAi0yagC3fBcdMnOM6Fm3cuZYQBaQOy4sDdIhMPUqZ4qZU960\ngSyWy5MQcB906+GxCRcrs+XkgiQDQYhm7qvzKMYvAoGBAJX3j9JA5AWz889n5Vt+\nPnOrOc8o0r7NMkxUong/mRW2C6gRvFhvNLI+Xg4rRLlKulEkvXKBXhe/V7JbH9KX\ncMArK6QItkBUVr8zCulaU0B1PQvpHE8GhHtaj35c1tJ/NaH/ZQPfZGqNrXy5APCw\naAMuXh4hZ3yfb7Gy6dOPRHhA\n-----END PRIVATE KEY-----\n`,
  clientEmail: "firebase-adminsdk-gl5nu@toolproof-563fe.iam.gserviceaccount.com"
};

const app = getApps().length === 0 
    ? initializeApp({
        credential: cert(serviceAccount),
    })
    : getApps()[0];

const db = getFirestore(app);

export { db };

