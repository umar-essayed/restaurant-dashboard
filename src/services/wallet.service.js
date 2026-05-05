import api from './api';

const walletService = {
  getSummary: async () => {
    const response = await api.get('/wallet/summary');
    return response.data;
  },

  getLedger: async (type, page = 1, limit = 20) => {
    const response = await api.get('/wallet/ledger', {
      params: { type, page, limit }
    });
    return response.data;
  },

  requestPayout: async (amount, idempotencyKey, mfaToken) => {
    const response = await api.post('/wallet/payout', { amount }, {
      headers: {
        'idempotency-key': idempotencyKey,
        'mfa-token': mfaToken,
        'app-integrity': 'valid-device-token' // Mocked for now
      }
    });
    return response.data;
  }
};

export default walletService;
