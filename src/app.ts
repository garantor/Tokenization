import express from 'express';
import { errorMiddleware } from './middleware/error.middleware';
import { investorRouter } from './modules/investors/investors.routes';
import { claimsRouter } from './modules/claims/claims.routes';
import { tokensRouter } from './modules/tokens/tokens.routes';
import { complianceRouter } from './modules/compliance/compliance.routes';
import { issuersRouter } from './modules/issuers/issuers.routes';

export const app = express();
app.use(express.json());

// In a real app, we'd iterate through modules or use a central router file
// For now, we'll manually mount them as we implement them.

app.use('/api/v1', investorRouter);
app.use('/api/v1', claimsRouter);
app.use('/api/v1', tokensRouter);
app.use('/api/v1', complianceRouter);
app.use('/api/v1', issuersRouter);

// Add more modules here:
// app.use('/api/v1', claimsRouter);
// ...

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(501).json({ error: 'Not implemented or Route not found' });
});

app.use(errorMiddleware);
